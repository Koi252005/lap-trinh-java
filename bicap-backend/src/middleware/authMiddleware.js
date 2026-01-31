const admin = require('../config/firebase');
const { User } = require('../models');
const fs = require('fs');
const path = require('path');
const debugLogPath = path.join(__dirname, '../../debug_auth.txt');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("No token provided");
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        let decodedToken;

        // Check if Firebase is initialized
        if (admin) {
            // BYPASS for Local Testing with scripts
            if (token === 'VALID_MOCK_TOKEN') {
                console.log('⚠️  Using Mock Token for Testing');
                decodedToken = {
                    uid: 'MOCK_FIREBASE_UID_123',
                    email: 'mockuser@example.com',
                    name: 'Mock User',
                    picture: 'https://via.placeholder.com/150'
                };
            } else {
                // Real verification
                try {
                    decodedToken = await admin.auth().verifyIdToken(token);
                } catch (error) {
                    console.error("Firebase Verify Error:", error.message);
                    throw error;
                }
            }
        } else {
            // Should not happen if config returns null but safeguards
            return res.status(500).json({ message: 'Firebase Admin not configured' });
        }

        req.userFirebase = decodedToken;

        // Try to fetch SQL user to populate req.user for controllers
        try {
            const user = await User.findOne({
                where: { firebaseUid: decodedToken.uid }
            });
            if (user) {
                req.user = user;
            }
        } catch (dbError) {
            console.error("Error fetching user in verifyToken:", dbError);
            // Don't block request, user might be syncing
        }

        next();
    } catch (error) {
        console.error("Token verification failed:", error);

        // Log to file to be sure
        const logMsg = `[${new Date().toISOString()}] Auth Error: ${error.message}\n`;
        try { fs.appendFileSync(debugLogPath, logMsg); } catch (e) { }

        return res.status(401).json({
            message: 'Unauthorized',
            error: error.message,
            code: error.code
        });
    }
};

// Middleware to check role based on SQL Database (after verification)
const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            const { uid, email } = req.userFirebase;

            // Check if database is connected
            let user = null;
            try {
                // Try to find user in SQL DB
                user = await User.findOne({
                    where: { firebaseUid: uid }
                });
            } catch (dbError) {
                // Database not connected - use fallback from syncUser response
                console.warn('Database not connected, using Firebase user info as fallback:', dbError.message);
                
                // Check if user info was provided in request (from syncUser fallback)
                if (req.user && req.user.firebaseUid === uid) {
                    // User info already populated from syncUser fallback
                    user = req.user;
                } else {
                    // Create temporary user object from Firebase info
                    // Use role from request body if available (from syncUser), otherwise default
                    // Check if user wants to be 'farm' role (from login/register)
                    const requestedRole = req.body?.role || 'retailer';
                    const defaultRole = roles.includes('farm') ? 'farm' : (roles.includes(requestedRole) ? requestedRole : 'retailer');
                    
                    if (roles.includes(defaultRole) || roles.includes('farm') || roles.includes('admin')) {
                        // Create mock user object for database-less mode
                        // Use a temporary ID based on Firebase UID hash
                        const tempId = Math.abs(uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000000;
                        user = {
                            id: tempId, // Temporary ID (not null to avoid validation errors)
                            firebaseUid: uid,
                            email: email,
                            role: defaultRole,
                            fullName: req.userFirebase.name || 'User'
                        };
                        req.user = user;
                        return next(); // Allow access in degraded mode
                    } else {
                        return res.status(403).json({ 
                            message: 'Forbidden: Insufficient permissions (Database not connected)',
                            warning: 'Database chưa kết nối. Một số tính năng có thể không hoạt động.'
                        });
                    }
                }
            }

            if (!user) {
                return res.status(401).json({ message: 'User not found in database. Please login first to sync.' });
            }

            if (!roles.includes(user.role)) {
                console.log(`[Auth] 403 Forbidden. User Role: '${user.role}', Allowed: [${roles.join(', ')}]`);
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }

            // Attach full SQL User object to request
            req.user = user;
            next();
        } catch (error) {
            console.error('Error in requireRole middleware:', error);
            return res.status(500).json({ 
                message: 'Server error checking roles', 
                error: error.message,
                details: 'Database may not be connected. Please check backend logs.'
            });
        }
    };
};

module.exports = { verifyToken, requireRole };

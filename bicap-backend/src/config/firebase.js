const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let firebaseApp = null;

try {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin Initialized successfully.');
    } else {
        console.warn('⚠️  serviceAccountKey.json not found in src/config/.');
        console.warn('⚠️  Firebase Auth will work in MOCK MODE (Verify Token will be skipped or mocked).');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
}

module.exports = admin;

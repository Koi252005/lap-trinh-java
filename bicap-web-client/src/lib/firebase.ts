import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Validate Firebase Configuration
const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if any required env vars are missing or still have placeholder values
const missingVars: string[] = [];
const placeholderPatterns = ['your_', 'placeholder', 'example', 'change_this'];

Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || placeholderPatterns.some(pattern => value.toLowerCase().includes(pattern))) {
        missingVars.push(`NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);
    }
});

if (missingVars.length > 0 && typeof window !== 'undefined') {
    console.error('❌ Firebase Configuration Error:', {
        message: 'Firebase environment variables are missing or not configured properly.',
        missing: missingVars,
        instructions: 'Please configure Firebase in your .env file. See SETUP_DOCKER.md for instructions.',
    });
}

const firebaseConfig = {
    apiKey: requiredEnvVars.apiKey || '',
    authDomain: requiredEnvVars.authDomain || '',
    projectId: requiredEnvVars.projectId || '',
    storageBucket: requiredEnvVars.storageBucket || '',
    messagingSenderId: requiredEnvVars.messagingSenderId || '',
    appId: requiredEnvVars.appId || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZVDJEQN2Y4"
};

// Initialize Firebase (prevent multiple initializations)
let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
} catch (error: any) {
    console.error('❌ Firebase Initialization Error:', error);
    if (typeof window !== 'undefined') {
        console.error('Firebase config:', {
            apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
            authDomain: firebaseConfig.authDomain || 'MISSING',
            projectId: firebaseConfig.projectId || 'MISSING',
        });
    }
    // Re-throw to prevent silent failures
    throw new Error(`Firebase initialization failed: ${error.message}. Please check your Firebase configuration in .env file.`);
}

export { auth, storage, googleProvider };

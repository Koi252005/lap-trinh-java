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
    // Use warn (not error) to avoid Next.js dev overlay blocking the UI
    console.warn('⚠️ Firebase Configuration Warning:', {
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

// IMPORTANT:
// - Do NOT initialize Firebase during SSR / build-time prerender.
// - Only initialize in the browser, and avoid throwing at import-time.

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;
let googleProvider: GoogleAuthProvider | undefined;

function canInitFirebaseInBrowser() {
    if (typeof window === "undefined") return false;
    if (missingVars.length > 0) return false;
    return true;
}

function initFirebaseClientIfNeeded() {
    if (!canInitFirebaseInBrowser()) return;
    if (app && auth && storage && googleProvider) return;

    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        storage = getStorage(app);
        googleProvider = new GoogleAuthProvider();
    } catch (error: unknown) {
        // warn to avoid Next.js dev overlay blocking the UI
        console.warn("⚠️ Firebase Initialization Warning:", error);
        // Keep exports undefined so UI can show a config warning instead of crashing builds.
        app = undefined;
        auth = undefined;
        storage = undefined;
        googleProvider = undefined;
    }
}

// Lazy exports (safe on server; initialize only in browser)
export function getFirebaseAuth() {
    initFirebaseClientIfNeeded();
    return auth;
}

export function getFirebaseStorage() {
    initFirebaseClientIfNeeded();
    return storage;
}

export function getGoogleProvider() {
    initFirebaseClientIfNeeded();
    return googleProvider;
}

// Back-compat named exports used across the app
initFirebaseClientIfNeeded();
export { auth, storage, googleProvider };

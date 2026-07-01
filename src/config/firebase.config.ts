import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin 
// Using applicationDefault() expects the GOOGLE_APPLICATION_CREDENTIALS 
// environment variable to point to your service account key JSON file.
// For development without it, we can temporarily bypass strict initialization, 
// but it's required for production.
if (!getApps().length) {
  try {
    initializeApp({
      credential: applicationDefault(),
      projectId: 'velora-b50eb',
    });
  } catch (error) {
    console.warn('Firebase Admin credentials not found. Initializing with projectId only for verifyIdToken.');
    initializeApp({
      projectId: 'velora-b50eb',
    });
  }
}

export const firebaseAuth = getAuth();

// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCwM7ivS6gZaclL_54XVQu9lXcEawwj2u0",
    authDomain: "hunter-bot-51c1a.firebaseapp.com",
    projectId: "hunter-bot-51c1a",
    storageBucket: "hunter-bot-51c1a.appspot.com",
    messagingSenderId: "262812247825",
    appId: "1:262812247825:web:2e0600ee1a27dc50a90eb0"
};  

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

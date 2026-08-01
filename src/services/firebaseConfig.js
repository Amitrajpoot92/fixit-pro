// src/services/firebaseConfig.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Platform } from 'react-native'; 

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// 🚀 1. SAFE APP INITIALIZATION (Crash Prevention)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Agar pehle se chal raha hai, toh wahi use karo
}

// 🚀 2. SAFE AUTH INITIALIZATION (Crash Prevention)
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // Agar auth galti se 2 baar call hua, toh app crash nahi hoga, catch ho jayega
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

const imageKitConfig = {
  urlEndpoint: "https://ik.imagekit.io/esuu73cdn",
  publicKey: "public_fmFrXf3YE/OcyFK1TEdUbQG+KLM=",
  privateKey: "private_x77JBMB4vB985OM8bOdAhUEoxW8="
};

export { app, auth, db, imageKitConfig };
// src/services/firebaseConfig.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Platform } from 'react-native'; 

const firebaseConfig = {
  apiKey: "AIzaSyAxAbK8CqYFBNAG_9TJkKx6cjgsV4I2DN0",
  authDomain: "fixit-pro-c9072.firebaseapp.com",
  projectId: "fixit-pro-c9072",
  storageBucket: "fixit-pro-c9072.firebasestorage.app",
  messagingSenderId: "23592787650",
  appId: "1:23592787650:web:e98034dd63cc271ca4e55b"
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
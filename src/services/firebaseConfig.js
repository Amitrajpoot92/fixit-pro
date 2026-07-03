import { initializeApp } from "firebase/app";
// 🚀 getAuth import kiya web ke liye
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
// 🚀 Naya import: Check karne ke liye ki app phone pe hai ya web pe
import { Platform } from 'react-native'; 

// 🔥 Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🚀 FIX: Platform ke hisaab se Auth setup
let auth;
if (Platform.OS === 'web') {
  // Web browser ke liye normal Auth (Ye apna session khud handle karega)
  auth = getAuth(app);
} else {
  // Mobile (Android/iOS) ke liye AsyncStorage wala persistence
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore Database
const db = getFirestore(app);

// 🖼️ ImageKit Configuration (Keys ko ek jagah securely rakhne ke liye)
const imageKitConfig = {
  urlEndpoint: process.env.EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  publicKey: process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY
};

export { app, auth, db, imageKitConfig };
// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig'; // Path check kar lena

// Context banaya
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Logged in user ka data yahan rahega
  const [loading, setLoading] = useState(true); // Jab tak Firebase check kar raha hai

  useEffect(() => {
    // Ye Firebase ka listener hai jo background mein chalta rahega
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // User login hai, ab uska pura data Firestore se mangwao
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Firebase Auth ka data aur Firestore ka data merge kar diya
            setUser({ uid: firebaseUser.uid, ...userDoc.data() });
          } else {
            // Agar Firestore me data nahi hai, toh bas uid aur email save karo
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          }
        } catch (error) {
          console.error("Error fetching user data in context:", error);
          setUser(null);
        }
      } else {
        // User guest hai (Logged out)
        setUser(null);
      }
      setLoading(false); // Check complete ho gaya
    });

    return () => unsubscribe(); // Cleanup function
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Ye custom hook banaya taaki kisi bhi screen me aaram se use kar sakein
export const useAuth = () => useContext(AuthContext);
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; 
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRole }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 🟢 ADMIN ROLE CHECK
          if (allowedRole === 'admin') {
            const adminDoc = await getDoc(doc(db, 'users', user.uid));
            if (adminDoc.exists() && adminDoc.data().role === 'admin') {
              setIsAuthorized(true); // ✅ Access Granted
            } else {
              setIsAuthorized(false); // ❌ Wrong Role
            }
          } 
          // 🟢 TECHNICIAN ROLE CHECK
          else if (allowedRole === 'technician') {
            const techDoc = await getDoc(doc(db, 'technicians', user.uid));
            if (techDoc.exists()) {
              setIsAuthorized(true); // ✅ Access Granted
            } else {
              setIsAuthorized(false); // ❌ Not found in technicians
            }
          }
          // 🟡 FALLBACK FOR UNKNOWN ROLES
          else {
             setIsAuthorized(false);
          }
        } catch (error) {
          console.error(`Error fetching role for ${allowedRole}:`, error);
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false); // ❌ Not Logged In
      }
    });

    return () => unsubscribe();
  }, [allowedRole]);

  // Jab tak check chal raha hai, tab tak Loader dikhao
  if (isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050B14]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Agar unauthorized hai, toh wapas respective login par bhej do
  if (!isAuthorized) {
    return <Navigate to={allowedRole === 'admin' ? '/admin' : '/technician'} replace />;
  }

  // Agar pass ho gaya, toh page render karo
  return children;
}
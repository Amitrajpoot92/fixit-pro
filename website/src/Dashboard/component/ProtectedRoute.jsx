import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; 
import { Loader2 } from 'lucide-react';

// 🚀 MEMORY CACHE: Route change hone par baar-baar database hit nahi karega
const roleCache = {};

export default function ProtectedRoute({ children, allowedRole }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ STEP 1: Agar role pehle se verified (cache) hai, toh bina loading seedha page khol do
        if (roleCache[user.uid] === allowedRole) {
          setIsAuthorized(true);
          return;
        }

        // 🔄 STEP 2: Agar cache nahi hai, tabhi Firestore se check karo
        try {
          let hasAccess = false;

          if (allowedRole === 'admin') {
            const adminDoc = await getDoc(doc(db, 'users', user.uid));
            if (adminDoc.exists() && adminDoc.data().role === 'admin') {
              hasAccess = true;
            }
          } else if (allowedRole === 'technician') {
            const techDoc = await getDoc(doc(db, 'technicians', user.uid));
            if (techDoc.exists()) {
              hasAccess = true;
            }
          }

          if (hasAccess) {
            roleCache[user.uid] = allowedRole; // Role save kar lo aage ke liye
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } catch (error) {
          console.error(`Route Error for ${allowedRole}:`, error);
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, [allowedRole]);

  // Loader (Ab yeh sirf first login par dikhega, tabs change karne par nahi)
  if (isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  // ❌ Unauthorized hone par safely login page bhej do
  if (!isAuthorized) {
    return <Navigate to={allowedRole === 'admin' ? '/admin' : '/technician'} state={{ from: location }} replace />;
  }

  // ✅ Access Granted
  return children;
}
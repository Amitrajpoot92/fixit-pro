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
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ STEP 1: Agar role pehle se verified (cache) hai
        const cachedRole = roleCache[user.uid];
        if (cachedRole) {
          if (allowedRole === 'admin' && (cachedRole === 'admin' || cachedRole === 'operator')) {
            setUserRole(cachedRole);
            setIsAuthorized(true);
            return;
          }
          if (allowedRole === 'technician' && cachedRole === 'technician') {
            setUserRole(cachedRole);
            setIsAuthorized(true);
            return;
          }
        }

        // 🔄 STEP 2: Firestore se check karo
        try {
          let resolvedRole = null;

          if (allowedRole === 'admin') {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const r = userDoc.data().role;
              if (r === 'admin' || r === 'operator') {
                resolvedRole = r;
              }
            } else {
              const opDoc = await getDoc(doc(db, 'operators', user.uid));
              if (opDoc.exists()) resolvedRole = 'operator';
            }
          } else if (allowedRole === 'technician') {
            const techDoc = await getDoc(doc(db, 'technicians', user.uid));
            if (techDoc.exists()) {
              const techData = techDoc.data();
              if (techData.status !== 'Inactive' && techData.status !== 'Suspended') {
                resolvedRole = 'technician';
              }
            }
          }

          if (resolvedRole) {
            roleCache[user.uid] = resolvedRole;
            setUserRole(resolvedRole);
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

  // Loader (first load par)
  if (isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  // ❌ Unauthorized hone par safely login page bhej do
  if (!isAuthorized) {
    return <Navigate to={allowedRole === 'admin' ? '/admin' : '/technician'} state={{ from: location }} replace />;
  }

  // 🛡️ ROLE-BASED ACCESS CONTROL FOR OPERATOR (Only 4 sections allowed)
  if (userRole === 'operator') {
    const operatorAllowedPaths = [
      '/admin/bookings',
      '/admin/product-orders',
      '/admin/products',
      '/admin/inventory',
      '/admin/catalog',
      '/admin/orders'
    ];

    const currentPath = location.pathname.toLowerCase();
    const isAllowed = operatorAllowedPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));

    if (!isAllowed) {
      // Operator tried to access admin-only area (Dashboard, Settings, Finance, etc.)
      return <Navigate to="/admin/bookings" replace />;
    }
  }

  // ✅ Access Granted
  return children;
}

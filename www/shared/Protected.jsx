import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "@/www/store/context-provider";
import { useFirebaseIdToken } from "@/www/hooks/useInitFirebaseIdToken";

import Spinner from "@/www/shared/Spinner";

export default function Protected({ children }) {
  const firebaseIdToken = useFirebaseIdToken();
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoadingFirebase(false);
    });
    return () => {
      unsubscribe();
    }
  }, []);

  if (loadingFirebase) {
      return <Spinner />;
  }

  const isAllowed = !!firebaseIdToken;

  if (isAllowed) {
    return children;
  }

  // Not authorised → go to login page
  return <Navigate to="/login" replace />;
}

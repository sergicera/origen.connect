import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/www/store/context-provider";

export function useAuthToken() {
  const [token, setToken] = useState(null);

  // Helper to set token only if it actually changed
  const safeSetToken = (newToken) =>
    setToken((prev) => (prev === newToken ? prev : newToken));

  useEffect(() => {
    // Subscribe to Firebase authentication state changes only
    const unsubscribeFirebase = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        safeSetToken(idToken);
      } else {
        safeSetToken(null);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribeFirebase();
    };
  }, []);

  return token;
}

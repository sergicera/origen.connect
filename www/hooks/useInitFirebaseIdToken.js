import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/www/store/context-provider";
import { usersDb, membersDb } from "@/services/firebase";
import { useAppContext } from "@/www/store/context-provider";

/**
 * Hook to get the Firebase ID token reactively.
 * Returns the ID token string if the user is signed in via Firebase, otherwise null.
 *
 * I. Verify user exists and has tenant membership
 * II. Set basic user data on global store
 * III. Return Firebase ID token
 *
 */
export function useFirebaseIdToken() {
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [, dispatch] = useAppContext();

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      if (!firebaseUser) {
        // No user signed in
        setIdToken(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        /**
         * Verify user and set basic data
         *
         * 1. Verify Firebase user exists in users table
         * 2. Set user's tenant membership
         * 3. Fetch Firebase ID token
         * */


        //  1. Verify user exists in users table and has a tenant membership
        const users = await usersDb.getUsers();
        const firebaseUserEmail = firebaseUser.email?.toLowerCase();
        const matchedUser = users?.find(
          (u) => u.email?.toLowerCase() === firebaseUserEmail
        );

        if (!matchedUser || !matchedUser.tenant_id) {
          console.warn(
            `[useFirebaseIdToken] No authorised user found with email ${firebaseUser.email}. Signing out.`
          );
          await signOut(auth);
          setIdToken(null);
          setLoading(false);
          return;
        }

        // At this point, matchedUser is valid and has a tenant_id
        const rtdbUserId = matchedUser.id;

        // 2. Set user's tenant membership
        const userTenantId = matchedUser.tenant_id;
        dispatch({
          type: "SET_CURRENT_ENTREPRISE", // TODO: Change to SET_CURRENT_TENANT
          payload: userTenantId,
        });

        // 3. Fetch FirebaseID token
        const currentIdToken = await firebaseUser.getIdToken();


        /**
         * Wrap up and return ID token
         */
        setIdToken(currentIdToken);

      } catch (error) {
        console.error(
          "[useFirebaseIdToken] Error during authorisation check:",
          error
        );
        await signOut(auth);
        setIdToken(null);
      } finally {
        setLoading(false); // Mark loading as complete

      }
    });

    // Cleanup listener on unmount
    return () => {

      unsubscribe();
    };
  }, []);

  // Maintain existing contract (string or null) but expose static property for loading if someone needs it
  return idToken;
}

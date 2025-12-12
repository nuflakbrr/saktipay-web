'use client';

import { createContext, FC, ReactNode, useEffect, useState } from 'react';
import { deleteCookie, setCookie } from "cookies-next";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { AppUser } from '@/interfaces/user';
import { useRouter } from 'next/navigation';

type Props = {
  children: ReactNode;
};

type ContextType = {
  user: AppUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
};

const defaultValue: ContextType = {
  user: null,
  isLoading: true,
  signIn: async () => { },
  logOut: async () => { },
};

const AuthContext = createContext<ContextType>(defaultValue);

export const AuthProvider: FC<Props> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Reference user in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      let appUser: AppUser;

      if (snap.exists()) {
        // User exists → use Firestore data
        appUser = snap.data() as AppUser;
      } else {
        // User not exists → create new user with default cashier role
        appUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          role: 'cashier',
        };

        await setDoc(userRef, {
          ...appUser,
          created_at: serverTimestamp(),
        });
      }

      setUser(appUser);
      setCookie("user_role", appUser.role);
      setCookie("user_uid", appUser.uid);
      setCookie("is_logged_in", "true");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
    deleteCookie("user_role");
    deleteCookie("user_uid");
    deleteCookie("is_logged_in");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

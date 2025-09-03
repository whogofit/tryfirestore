"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
import { setCookie, deleteCookie } from "cookies-next";

// This is a custom hook. It should be used *inside* a component.
function useUserSession(initialUser) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    // This is the Firebase authentication listener
    const unsubscribe = onIdTokenChanged(async (authUser) => {
      if (authUser) {
        const idToken = await authUser.getIdToken();
        setCookie("__session", idToken);
      } else {
        deleteCookie("__session");
      }
      setUser(authUser); // Update the user state
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs only once

  return user;
}

// This is the main component
export function Header({ initialUser }) {
  const user = useUserSession(initialUser);

  const handleSignOut = (event) => {
    event.preventDefault();
    signOut();
  };

  const handleSignIn = (event) => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <header>
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {user.displayName}
            </p>

            <div className="menu">
              {/* ... */}
              <ul>
                <li>{user.displayName}</li>
                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}

// Note: The `Header` component above would be used in a parent component like this:
// import { Header } from './Header';
// export default function Page({ initialUser }) {
//   return <Header initialUser={initialUser} />;
// }
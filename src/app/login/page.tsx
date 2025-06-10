
"use client";

import React, { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from '../../lib/firebase'; 

const Login: React.FC = () => {
  useEffect(() => {
    // Define uiConfig directly here as it's client-side only
    const uiConfig: firebaseui.auth.Config = {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        { 
          provider: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD, 
          requireDisplayName: false 
        },
        // Example: to add Anonymous provider, if needed by FirebaseUI for some flows or if desired
        // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID 
      ],
      signInSuccessUrl: '/dashboard', 
      // Optional: Add callbacks for sign-in success and failure
      // callbacks: {
      //   signInSuccessWithAuthResult: (authResult, redirectUrl) => {
      //     // Handle successful sign-in
      //     return true; // Return true to redirect
      //   },
      //   uiShown: () => {
      //     // The widget is rendered. Hide the loader.
      //   },
      // },
    };

    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    ui.start('#firebaseui-auth-container', uiConfig);

    return () => {
      // Clean up FirebaseUI instance on unmount
      if (ui && ui.delete) {
        ui.delete();
      }
    };
  }, []);

  return (
    <div>
      <h1>Login</h1>
      <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default Login;

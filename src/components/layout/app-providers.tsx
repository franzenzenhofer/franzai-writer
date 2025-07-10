"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { auth } from "@/lib/firebase"; // Adjust the import path as needed
import { getOrCreateTemporarySession, clearTemporarySession, TemporaryUser } from "@/lib/auth/temporary-session";

interface AuthContextType {
  user: User | null;
  tempUser: TemporaryUser | null;
  loading: boolean;
  effectiveUser: { uid: string; isTemporary?: boolean } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('auth')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tempUser, setTempUser] = useState<TemporaryUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Real user logged in, clear any temporary session
        clearTemporarySession();
        setTempUser(null);
      } else {
        // No authenticated user, create/get temporary session
        const tempSession = getOrCreateTemporarySession();
        setTempUser(tempSession);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute effective user (real user takes precedence over temp user)
  const effectiveUser = user ? { uid: user.uid } : tempUser ? { uid: tempUser.uid, isTemporary: true } : null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, tempUser, loading, effectiveUser }}>
        {children}
      </AuthContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

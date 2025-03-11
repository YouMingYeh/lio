"use client";

import liff, { Liff } from "@line/liff";
import { useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

// Define the context type
interface LiffContextProps {
  liff: Liff | null;
  error: string | null;
  login: () => void;
  logout: () => void;
  isLoggedIn: boolean;
}

// Create a context for the LIFF instance with default values
const LiffContext = createContext<LiffContextProps | undefined>(undefined);

// Custom hook to access the LIFF instance from the context
export function useLiff() {
  const context = useContext(LiffContext);

  if (!context) {
    throw new Error("useLiff must be used within a LiffProvider");
  }

  return context;
}

// Provider component to wrap your app and provide the LIFF instance
export function LiffProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    liff
      .init({
        liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
        withLoginOnExternalBrowser: false,
      })
      .then(() => {
        setLiffObject(liff);
      })
      .catch((error) => {
        console.error(`liff.init() failed: ${error}`);
        if (!process.env.NEXT_PUBLIC_LIFF_ID) {
          console.info(
            "LIFF Starter: Please make sure that you provided `NEXT_PUBLIC_LIFF_ID` as an environmental variable.",
          );
        }
        setLiffError(error.toString());
      });
  }, [isLoggedIn]);

  // Login function to open the LIFF login screen
  const login = useCallback(() => {
    if (liffObject?.isLoggedIn()) {
      setIsLoggedIn(true);
      return;
    }
    liff.login();

    if (liffObject?.isLoggedIn()) {
      setIsLoggedIn(true);
      return;
    }
  }, [liffObject]);

  useEffect(() => {
    const loginOnMount = async () => {
      if (source === "line") {
        login();
      }
    };
    loginOnMount();
  }, [login, source]);

  // Logout function to log out the user
  const logout = () => {
    if (!liffObject?.isLoggedIn()) {
      setIsLoggedIn(false);
      return;
    }
    liff.logout();
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <LiffContext.Provider
      value={{ liff: liffObject, error: liffError, login, logout, isLoggedIn }}
    >
      {children}
    </LiffContext.Provider>
  );
}

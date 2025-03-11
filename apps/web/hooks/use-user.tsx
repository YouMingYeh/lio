"use client";

import { useLiff } from "./use-liff";
import { Tables } from "@/database.types";
import { createClient } from "@/lib/supabase/client";
import { KeysToCamelCase, snakeToCamelCase } from "@/lib/utils";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";

export type User = KeysToCamelCase<Tables<"user">>;

export type Profile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  lineProfile: Profile | null;
  isFetching: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { liff: liffObject, isLoggedIn } = useLiff();
  const [user, setUser] = useState<User | null>(null);
  const [lineProfile, setLineProfile] = useState<Profile | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    // Only run if liffObject is available.
    if (!liffObject) return;
    const loadUser = async () => {
      try {
        // Get LINE profile if logged in via LIFF.
        const lp = liffObject.isLoggedIn()
          ? await liffObject.getProfile()
          : null;

        if (lp) {
          setLineProfile(lp);
        }

        const supabase = createClient();
        let fetchedUser: Tables<"user"> | null = null;

        // Try fetching using LINE profile data first.
        if (lp?.userId) {
          const { data, error } = await supabase
            .from("user")
            .select("*")
            .eq("line_user_id", lp.userId)
            .single();

          if (error) {
            console.error("Error fetching user by LINE id", error);
          } else {
            fetchedUser = data;
          }
        }

        // If not found, create a new user from LINE profile.
        if (!fetchedUser && lp?.userId) {
          const { data, error } = await supabase
            .from("user")
            .insert({
              display_name: lp.displayName,
              avatar_url: lp.pictureUrl,
              line_user_id: lp.userId,
            })
            .select("*")
            .single();
          if (error) {
            console.error("Error creating user from LINE profile", error);
          } else {
            fetchedUser = data;
          }
        }

        if (fetchedUser) {
          setUser(snakeToCamelCase(fetchedUser));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setTimeout(() => {
          setIsFetching(false);
        }, 1000);
      }
    };

    loadUser();
  }, [liffObject, isLoggedIn, isMounted]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      lineProfile,
      isFetching,
      setIsFetching,
    }),
    [user, lineProfile, isFetching],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

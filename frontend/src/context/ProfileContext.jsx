import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPhotographerProfile } from "../services/api";
import { PHOTOGRAPHER as DEFAULT_PHOTOGRAPHER } from "../data/sampleData";

const CACHE_KEY = "cached_photographer_profile";

function getInitialProfile() {
  if (typeof window === "undefined") return DEFAULT_PHOTOGRAPHER;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.name) {
        return { ...DEFAULT_PHOTOGRAPHER, ...parsed };
      }
    }
  } catch {
    // Ignore storage parse issues
  }
  return DEFAULT_PHOTOGRAPHER;
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(getInitialProfile);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getPhotographerProfile();
      if (data && data.name) {
        setProfile((prev) => {
          const merged = { ...prev, ...data };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
            } catch {
              // Ignore storage errors
            }
          }
          return merged;
        });
      }
    } catch {
      // Keep existing cached profile on network/offline error
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateCachedProfile = useCallback((newProfile) => {
    setProfile((prev) => {
      const merged = { ...prev, ...newProfile };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        } catch {
          // Ignore storage errors
        }
      }
      return merged;
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateCachedProfile, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  return (
    ctx || {
      profile: DEFAULT_PHOTOGRAPHER,
      updateCachedProfile: () => {},
      refreshProfile: () => {},
    }
  );
}

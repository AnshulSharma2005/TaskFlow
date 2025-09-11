import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth, handleAuthRedirect, createUserProfile, getUserProfile } from "@/lib/firebase";
import { onAuthStateChanged } from "@/lib/firebase";
import type { User } from "@shared/schema";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setError(null);

      if (user) {
        try {
          // Check if user profile exists
          let profile = await getUserProfile(user.uid);
          
          if (!profile) {
            // Create user profile if it doesn't exist
            const newUserProfile: any = {
              id: user.uid,
              email: user.email!,
            };
            
            // Only include optional fields if they have values
            if (user.displayName) {
              newUserProfile.displayName = user.displayName;
            }
            if (user.photoURL) {
              newUserProfile.photoURL = user.photoURL;
            }
            await createUserProfile(newUserProfile);
            profile = await getUserProfile(user.uid);
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setError("Failed to load user profile");
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result from Google OAuth
    handleAuthRedirect().then((result) => {
      if (result?.user) {
        // User signed in via redirect
        console.log("User signed in via redirect:", result.user);
      }
    }).catch((error) => {
      console.error("Error handling redirect:", error);
      setError("Authentication failed");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

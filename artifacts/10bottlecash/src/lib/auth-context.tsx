import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { _setCurrentUser, type User, type Role } from "./auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

async function fetchProfile(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", userId)
    .single();
  if (!data) return null;
  return { id: data.id, email: data.email, name: data.name, role: data.role as Role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          _setCurrentUser(profile);
          setUser(profile);
        }
      }
      setLoading(false);
    });

    // Keep in sync with Supabase auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          _setCurrentUser(profile);
          setUser(profile);
        }
      } else {
        _setCurrentUser(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#F5A623",
            fontFamily: "monospace",
            fontSize: "12px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          10BOTTLECASH
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

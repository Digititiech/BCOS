'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Receptionist' | 'Staff' | 'Customer';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setPreviewRole: (role: UserRole) => void; // Support role-switching in mockup sandbox mode
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // For testing layout designs in Sprint 0, support toggling roles locally
  const setPreviewRole = (role: UserRole) => {
    if (profile) {
      setProfile({
        ...profile,
        role,
      });
    }
  };

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Query profile role from DB profiles table
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('role, organization_id, first_name, last_name')
            .eq('id', session.user.id)
            .single();

          if (dbProfile) {
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              role: dbProfile.role as UserRole,
              organizationId: dbProfile.organization_id,
              firstName: dbProfile.first_name,
              lastName: dbProfile.last_name,
            });
          } else {
            // Seeding default sandbox user if session exists but profile does not yet
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              role: 'Customer',
              organizationId: '8a3e9c40-410a-4fb4-87cf-4545598687a0',
            });
          }
        } else {
          // If no session exists, configure a sandbox profile for visual layout testing
          setUser(null);
          setProfile({
            id: 'sandbox-id',
            email: 'admin@bcos.om',
            role: 'Admin',
            organizationId: '8a3e9c40-410a-4fb4-87cf-4545598687a0',
            firstName: 'Ahmed',
            lastName: 'Al-Omani',
          });
        }
      } catch (e) {
        console.error('Error fetching Auth Session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('role, organization_id, first_name, last_name')
          .eq('id', session.user.id)
          .single();

        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          role: (dbProfile?.role as UserRole) || 'Customer',
          organizationId: dbProfile?.organization_id || null,
          firstName: dbProfile?.first_name,
          lastName: dbProfile?.last_name,
        });
      } else {
        setUser(null);
        // Fallback to sandbox admin for UI preview in development
        setProfile({
          id: 'sandbox-id',
          email: 'admin@bcos.om',
          role: 'Admin',
          organizationId: '8a3e9c40-410a-4fb4-87cf-4545598687a0',
          firstName: 'Ahmed',
          lastName: 'Al-Omani',
        });
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, setPreviewRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Child = Database['public']['Tables']['children']['Row'];

interface ChildSessionContextType {
  child: Child | null;
  loading: boolean;
  linkChildWithCode: (code: string, deviceId: string) => Promise<{ child?: Child; error?: any }>;
  clearChildSession: () => Promise<void>;
}

const ChildSessionContext = createContext<ChildSessionContextType | undefined>(undefined);

const DEVICE_ID_KEY = '@zoomi_device_id';

export function ChildSessionProvider({ children }: { children: React.ReactNode }) {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkChildSession();
  }, []);

  const checkChildSession = async () => {
    try {
      const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (deviceId) {
        const { data, error } = await supabase.rpc('get_child_session', {
          p_device_id: deviceId,
        });

        if (error) throw error;

        if (data && data.success && data.child) {
          setChild(data.child);
        } else {
          await AsyncStorage.removeItem(DEVICE_ID_KEY);
        }
      }
    } catch (error) {
      console.error('Error checking child session:', error);
      await AsyncStorage.removeItem(DEVICE_ID_KEY);
    } finally {
      setLoading(false);
    }
  };

  const linkChildWithCode = async (code: string, deviceId: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_and_link_child', {
        p_linking_code: code,
        p_device_id: deviceId,
      });

      if (error) throw error;

      if (!data.success) {
        return { error: { message: data.error } };
      }

      const childData = data.child;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      setChild(childData);

      return { child: childData };
    } catch (error) {
      return { error };
    }
  };

  const clearChildSession = async () => {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
    setChild(null);
  };

  const value: ChildSessionContextType = {
    child,
    loading,
    linkChildWithCode,
    clearChildSession,
  };

  return (
    <ChildSessionContext.Provider value={value}>
      {children}
    </ChildSessionContext.Provider>
  );
}

export function useChildSession() {
  const context = useContext(ChildSessionContext);
  if (context === undefined) {
    throw new Error('useChildSession must be used within a ChildSessionProvider');
  }
  return context;
}

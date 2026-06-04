import { useState, useEffect, useCallback, useRef } from 'react';
import { getMyProfileAPI } from '../services/profileService';
import { UserProfile } from '../types';
import axios from 'axios';

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserProfile = (): UseUserProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  const controllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // 1. Cancel previous pending request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    // 2. Create new controller
    const controller = new AbortController();
    controllerRef.current = controller;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiResponse = await getMyProfileAPI(controller.signal);
        setProfile(apiResponse.data);
      } catch (err: any) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return; // Skip state update if request was cancelled
        }
        
        console.error('Error fetching profile:', err);
        const serverMessage = err.response?.data?.message || 'Không thể tải thông tin hồ sơ.';
        setError(serverMessage);
        setProfile(null);
      } finally {
        if (controllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    // 3. Cleanup on unmount
    return () => {
      controller.abort();
    };
  }, [retryCount]);

  return { profile, isLoading, error, refetch };
};

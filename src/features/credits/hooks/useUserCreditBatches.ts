import { useCallback, useEffect, useState } from 'react';
import { fetchUserCreditBatches } from '../services/creditPackageService';
import type { UserCreditBatches } from '../types';

const emptyBatches: UserCreditBatches = {
  posting: [],
  featured: [],
};

export const useUserCreditBatches = (enabled = true) => {
  const [batches, setBatches] = useState<UserCreditBatches>(emptyBatches);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const loadBatches = useCallback(async () => {
    if (!enabled) {
      setBatches(emptyBatches);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setBatches(await fetchUserCreditBatches());
    } catch {
      setBatches(emptyBatches);
      setError('Không tải được credits hiện tại.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadBatches();

    const handleCreditUpdate = () => {
      void loadBatches();
    };

    window.addEventListener('revora_credit_updated', handleCreditUpdate);
    return () => window.removeEventListener('revora_credit_updated', handleCreditUpdate);
  }, [loadBatches]);

  return {
    batches,
    isLoading,
    error,
    refresh: loadBatches,
  };
};

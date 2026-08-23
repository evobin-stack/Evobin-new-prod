import { useState, useCallback } from 'react';
import type { ApiResponse } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<ApiResponse<T>>;
  reset: () => void;
}

/**
 * Custom hook for handling API calls with loading and error states
 * 
 * @param apiFunction - The API function to call
 * @returns Object containing data, loading, error states and execute function
 * 
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useApi(api.user.getProfile);
 * 
 * useEffect(() => {
 *   execute();
 * }, []);
 * ```
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiFunction(...args);

        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error || 'An error occurred',
          });
        }

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setState({ data: null, loading: false, error: errorMessage });

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Custom hook for handling mutations (POST, PUT, DELETE) with success callbacks
 * 
 * @param apiFunction - The API mutation function to call
 * @param onSuccess - Optional callback on successful mutation
 * @returns Object containing loading, error states and mutate function
 * 
 * @example
 * ```tsx
 * const { mutate, loading } = useMutation(
 *   api.rewards.redeemReward,
 *   (data) => {
 *     toast.success('Reward redeemed!');
 *   }
 * );
 * ```
 */
export function useMutation<T, A extends any[]>(
  apiFunction: (...args: A) => Promise<ApiResponse<T>>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: A) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...args);

        if (response.success && response.data) {
          onSuccess?.(response.data);
        } else {
          const errorMsg = response.error || 'An error occurred';
          setError(errorMsg);
          onError?.(errorMsg);
        }

        setLoading(false);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        setLoading(false);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [apiFunction, onSuccess, onError]
  );

  return {
    mutate,
    loading,
    error,
  };
}

/**
 * Hook for optimistic updates
 * Updates UI immediately and rolls back on error
 */
export function useOptimisticMutation<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  optimisticUpdate: () => void,
  rollback: () => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      // Apply optimistic update
      optimisticUpdate();

      try {
        const response = await apiFunction(...args);

        if (!response.success) {
          // Rollback on error
          rollback();
          const errorMsg = response.error || 'An error occurred';
          setError(errorMsg);
        }

        setLoading(false);
        return response;
      } catch (error) {
        // Rollback on exception
        rollback();
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(errorMessage);
        setLoading(false);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [apiFunction, optimisticUpdate, rollback]
  );

  return {
    mutate,
    loading,
    error,
  };
}

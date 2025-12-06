import { useCallback, useRef } from 'react';

/**
 * Memoized callback hook that prevents unnecessary re-renders
 * Similar to useCallback but with better performance
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ callback: T; deps: React.DependencyList }>();
  
  // Update ref when dependencies change
  if (!ref.current || deps.some((dep, index) => dep !== ref.current?.deps[index])) {
    ref.current = { callback, deps };
  }
  
  return useCallback(ref.current.callback, deps);
}

/**
 * Memoized value hook that prevents unnecessary recalculations
 * Similar to useMemo but with better performance
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ value: T; deps: React.DependencyList }>();
  
  if (!ref.current || deps.some((dep, index) => dep !== ref.current?.deps[index])) {
    ref.current = { value: factory(), deps };
  }
  
  return ref.current.value;
}

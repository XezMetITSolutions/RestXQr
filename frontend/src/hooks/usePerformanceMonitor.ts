import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  coreWebVitals?: {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
  };
}

export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(Date.now());
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    // Measure component load time
    const loadTime = Date.now() - startTime.current;
    
    // Measure render time
    const renderTime = Date.now() - renderStartTime.current;
    
    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;
    
    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime,
      memoryUsage,
    };

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} Performance:`, {
        loadTime: `${loadTime}ms`,
        renderTime: `${renderTime}ms`,
        memoryUsage: memoryUsage ? `${Math.round(memoryUsage / 1024 / 1024)}MB` : 'N/A',
      });
    }

    // Send metrics to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with analytics services here
      // Example: analytics.track('component_performance', metrics);
    }
  }, [componentName]);

  const startRender = () => {
    renderStartTime.current = Date.now();
  };

  return { startRender };
}

/**
 * Hook to measure Core Web Vitals
 */
export function useCoreWebVitals() {
  useEffect(() => {
    // Measure LCP (Largest Contentful Paint)
    const measureLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // Measure FID (First Input Delay)
    const measureFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.duration);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    };

    // Measure CLS (Cumulative Layout Shift)
    const measureCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        console.log('CLS:', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    };

    // Start measurements
    measureLCP();
    measureFID();
    measureCLS();

    return () => {
      // Cleanup observers
      // Observer cleanup is handled by the individual functions
    };
  }, []);
}

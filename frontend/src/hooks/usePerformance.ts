import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

export function usePerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Performance metriklerini kaydet
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      };

      // Development modunda console'a yazdır
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          memoryUsage: metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
        });
      }

      // Production'da analytics servisine gönder
      if (process.env.NODE_ENV === 'production') {
        // Analytics servisine gönder
        // sendPerformanceMetrics(metrics);
      }
    };
  });

  return {
    renderCount: renderCount.current
  };
}

export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render Count] ${componentName}: ${renderCount.current}`);
    }
  });

  return renderCount.current;
}

export function useMemoryUsage() {
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ((performance as any).memory) {
        setMemoryUsage((performance as any).memory.usedJSHeapSize);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Her 5 saniyede bir

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

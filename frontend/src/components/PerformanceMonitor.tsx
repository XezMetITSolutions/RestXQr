'use client';

import { useEffect, useState } from 'react';
import { FaTachometerAlt, FaMemory, FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface PerformanceData {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  memoryUsage: number;
  renderTime: number;
}

export default function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sadece development modunda göster
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const data: PerformanceData = {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0,
        memoryUsage: 0,
        renderTime: 0
      };

      // Web Vitals ölçümü
      if ('PerformanceObserver' in window) {
        // FCP (First Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            data.fcp = fcpEntry.startTime;
          }
        }).observe({ entryTypes: ['paint'] });

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          data.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            data.fid = entry.processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          data.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
      }

      // TTFB (Time to First Byte)
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        data.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // Memory usage
      if ((performance as any).memory) {
        data.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      // Render time (component mount time)
      const renderStart = performance.now();
      data.renderTime = renderStart;

      setPerformanceData(data);
    };

    // İlk yükleme sonrası ölç
    const timer = setTimeout(measurePerformance, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Sadece development modunda göster
  if (process.env.NODE_ENV !== 'development' || !performanceData) {
    return null;
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMemoryColor = (value: number) => {
    if (value < 50) return 'text-green-600';
    if (value < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Performance Monitor"
      >
        <FaTachometerAlt className="text-lg" />
      </button>

      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* Web Vitals */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">FCP:</span>
                <span className={getPerformanceColor(performanceData.fcp, { good: 1800, poor: 3000 })}>
                  {performanceData.fcp.toFixed(0)}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">LCP:</span>
                <span className={getPerformanceColor(performanceData.lcp, { good: 2500, poor: 4000 })}>
                  {performanceData.lcp.toFixed(0)}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">FID:</span>
                <span className={getPerformanceColor(performanceData.fid, { good: 100, poor: 300 })}>
                  {performanceData.fid.toFixed(0)}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">CLS:</span>
                <span className={getPerformanceColor(performanceData.cls, { good: 0.1, poor: 0.25 })}>
                  {performanceData.cls.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <FaMemory className="mr-1" />
                  Memory:
                </span>
                <span className={getMemoryColor(performanceData.memoryUsage)}>
                  {performanceData.memoryUsage.toFixed(1)}MB
                </span>
              </div>
            </div>

            {/* TTFB */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <FaClock className="mr-1" />
                TTFB:
              </span>
              <span className={getPerformanceColor(performanceData.ttfb, { good: 200, poor: 500 })}>
                {performanceData.ttfb.toFixed(0)}ms
              </span>
            </div>

            {/* Performance Score */}
            <div className="border-t pt-3">
              <div className="text-xs text-gray-500 text-center">
                Development Mode - Performance metrics
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

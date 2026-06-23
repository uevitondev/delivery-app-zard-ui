/**
 * Core Web Vitals Tracking
 * Mede métricas de performance: FCP, LCP, CLS, FID, TTFB
 */

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type MetricCallback = (metric: WebVitalsMetric) => void;

const listeners = new Set<MetricCallback>();

export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // FCP - First Contentful Paint
  observeFCP();

  // LCP - Largest Contentful Paint
  observeLCP();

  // CLS - Cumulative Layout Shift
  observeCLS();

  // FID - First Input Delay
  observeFID();

  // TTFB - Time to First Byte
  observeTTFB();
}

function observeFCP() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const metric = createMetric('FCP', entry.startTime);
        notifyListeners(metric);
        observer.disconnect();
      }
    }
  });

  try {
    observer.observe({ type: 'paint', buffered: true });
  } catch {
    // Fallback para navegadores que não suportam
    console.warn('FCP observation not supported');
  }
}

function observeLCP() {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as LargestContentfulPaint;
    
    const metric = createMetric('LCP', lastEntry.startTime);
    notifyListeners(metric);
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    console.warn('LCP observation not supported');
  }
}

function observeCLS() {
  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: any[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

        if (
          sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000
        ) {
          sessionValue += (entry as any).value;
          sessionEntries.push(entry);
        } else {
          sessionValue = (entry as any).value;
          sessionEntries = [entry];
        }

        const newClsValue = Math.max(clsValue, sessionValue);
        if (newClsValue !== clsValue) {
          clsValue = newClsValue;
          const metric = createMetric('CLS', clsValue);
          notifyListeners(metric);
        }
      }
    }
  });

  try {
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    console.warn('CLS observation not supported');
  }
}

function observeFID() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const metric = createMetric('FID', (entry as any).processingStart - entry.startTime);
      notifyListeners(metric);
    }
  });

  try {
    observer.observe({ type: 'first-input', buffered: true });
  } catch {
    console.warn('FID observation not supported');
  }
}

function observeTTFB() {
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigationEntry) {
    const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    const metric = createMetric('TTFB', ttfb);
    notifyListeners(metric);
  }
}

function createMetric(name: string, value: number): WebVitalsMetric {
  const rating = getRating(name, value);
  
  return {
    name,
    value,
    rating,
    delta: value,
    id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function notifyListeners(metric: WebVitalsMetric) {
  listeners.forEach((callback) => callback(metric));
}

export function onWebVitals(callback: MetricCallback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
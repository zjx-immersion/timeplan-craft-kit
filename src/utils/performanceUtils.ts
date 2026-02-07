/**
 * 性能优化工具
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

/**
 * 防抖
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 节流
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function (...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}

/**
 * RequestAnimationFrame 包装
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function (...args: Parameters<T>) {
    if (rafId !== null) {
      return;
    }
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * 批量更新
 */
export class BatchUpdater {
  private queue: Array<() => void> = [];
  private rafId: number | null = null;
  
  add(fn: () => void) {
    this.queue.push(fn);
    this.scheduleFlush();
  }
  
  private scheduleFlush() {
    if (this.rafId !== null) {
      return;
    }
    
    this.rafId = requestAnimationFrame(() => {
      this.flush();
    });
  }
  
  private flush() {
    const queue = this.queue.slice();
    this.queue = [];
    this.rafId = null;
    
    queue.forEach(fn => fn());
  }
}

/**
 * 虚拟滚动计算
 */
export interface VirtualScrollConfig {
  totalItems: number;
  itemHeight: number;
  containerHeight: number;
  scrollTop: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  visibleItems: number;
}

export function calculateVirtualScroll(
  config: VirtualScrollConfig
): VirtualScrollResult {
  const { totalItems, itemHeight, containerHeight, scrollTop, overscan = 3 } = config;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleItems = Math.ceil(containerHeight / itemHeight) + overscan * 2;
  const endIndex = Math.min(totalItems - 1, startIndex + visibleItems);
  const offsetY = startIndex * itemHeight;
  
  return {
    startIndex,
    endIndex,
    offsetY,
    visibleItems,
  };
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  
  start(label: string) {
    this.marks.set(label, performance.now());
  }
  
  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark for: ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.marks.delete(label);
    
    return duration;
  }
  
  measure(label: string, fn: () => void): number {
    this.start(label);
    fn();
    return this.end(label);
  }
  
  async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.start(label);
    await fn();
    return this.end(label);
  }
}

/**
 * 内存优化：对象池
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  
  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }
  
  acquire(): T {
    return this.pool.length > 0 ? this.pool.pop()! : this.factory();
  }
  
  release(obj: T) {
    this.reset(obj);
    this.pool.push(obj);
  }
}

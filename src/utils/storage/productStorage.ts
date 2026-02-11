/**
 * Product存储工具
 * 
 * 使用localStorage持久化Product数据
 * 
 * @module utils/storage/productStorage
 */

import type { Product } from '@/types/product';

const STORAGE_KEY = 'timeplan-products';
const STORAGE_VERSION = '1.0.0';

/**
 * 存储数据结构
 */
interface ProductStorageData {
  version: string;
  products: Product[];
  lastUpdated: string;
}

/**
 * 保存Products到localStorage
 */
export function saveProducts(products: Product[]): void {
  try {
    const data: ProductStorageData = {
      version: STORAGE_VERSION,
      products,
      lastUpdated: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[ProductStorage] 保存失败:', error);
    throw new Error('保存Product数据失败');
  }
}

/**
 * 从localStorage加载Products
 */
export function loadProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return [];
    }
    
    const data: ProductStorageData = JSON.parse(stored);
    
    // 版本检查
    if (data.version !== STORAGE_VERSION) {
      console.warn('[ProductStorage] 版本不匹配，尝试迁移...');
      // 这里可以添加版本迁移逻辑
    }
    
    // 转换Date字段
    return data.products.map(product => ({
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    }));
  } catch (error) {
    console.error('[ProductStorage] 加载失败:', error);
    return [];
  }
}

/**
 * 清除Products数据
 */
export function clearProducts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[ProductStorage] 清除失败:', error);
  }
}

/**
 * 根据ID获取Product
 */
export function getProductById(id: string): Product | undefined {
  const products = loadProducts();
  return products.find(p => p.id === id);
}

/**
 * 添加Product
 */
export function addProduct(product: Product): void {
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
}

/**
 * 更新Product
 */
export function updateProduct(id: string, updates: Partial<Product>): void {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error(`Product ${id} 不存在`);
  }
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  saveProducts(products);
}

/**
 * 删除Product
 */
export function deleteProduct(id: string): void {
  const products = loadProducts();
  const filtered = products.filter(p => p.id !== id);
  
  if (filtered.length === products.length) {
    throw new Error(`Product ${id} 不存在`);
  }
  
  saveProducts(filtered);
}

/**
 * 批量导入Products
 */
export function importProducts(products: Product[], mode: 'merge' | 'replace' = 'merge'): void {
  if (mode === 'replace') {
    saveProducts(products);
  } else {
    const existing = loadProducts();
    const existingIds = new Set(existing.map(p => p.id));
    
    // 过滤掉已存在的ID
    const newProducts = products.filter(p => !existingIds.has(p.id));
    
    saveProducts([...existing, ...newProducts]);
  }
}

/**
 * 导出Products
 */
export function exportProducts(): Product[] {
  return loadProducts();
}

/**
 * 获取存储统计信息
 */
export function getStorageStats() {
  const products = loadProducts();
  const stored = localStorage.getItem(STORAGE_KEY);
  const size = stored ? new Blob([stored]).size : 0;
  
  return {
    count: products.length,
    size,
    sizeKB: (size / 1024).toFixed(2),
    lastUpdated: stored ? JSON.parse(stored).lastUpdated : null,
  };
}

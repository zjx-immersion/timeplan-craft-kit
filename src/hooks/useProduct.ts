/**
 * useProduct Hook
 * 
 * Product数据管理Hook
 * 
 * @module hooks/useProduct
 */

import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import type { Product, ProductCreate, ProductUpdate } from '@/types/product';
import * as ProductStorage from '@/utils/storage/productStorage';

export function useProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载Products
  const loadProducts = useCallback(() => {
    try {
      const loaded = ProductStorage.loadProducts();
      setProducts(loaded);
    } catch (error) {
      message.error('加载Product失败');
      console.error(error);
    }
  }, []);

  // 创建Product
  const createProduct = useCallback((data: ProductCreate): Product => {
    try {
      const product: Product = {
        id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      ProductStorage.addProduct(product);
      setProducts(prev => [...prev, product]);
      message.success(`Product "${product.name}" 创建成功`);
      
      return product;
    } catch (error) {
      message.error('创建Product失败');
      throw error;
    }
  }, []);

  // 更新Product
  const updateProduct = useCallback((id: string, updates: ProductUpdate) => {
    try {
      ProductStorage.updateProduct(id, updates);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p))
      );
      message.success('Product更新成功');
    } catch (error) {
      message.error('更新Product失败');
      throw error;
    }
  }, []);

  // 删除Product
  const deleteProduct = useCallback((id: string) => {
    try {
      ProductStorage.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      message.success('Product删除成功');
    } catch (error) {
      message.error('删除Product失败');
      throw error;
    }
  }, []);

  // 根据ID获取Product
  const getProductById = useCallback(
    (id: string): Product | undefined => {
      return products.find(p => p.id === id);
    },
    [products]
  );

  // 批量删除
  const deleteProducts = useCallback((ids: string[]) => {
    try {
      ids.forEach(id => ProductStorage.deleteProduct(id));
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
      message.success(`已删除 ${ids.length} 个Product`);
    } catch (error) {
      message.error('批量删除失败');
      throw error;
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    setLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    getProductById,
    refreshProducts: loadProducts,
  };
}

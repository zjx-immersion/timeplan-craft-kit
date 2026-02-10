/**
 * 产品选择器组件（Ant Design版本）
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React from 'react';
import { Product } from '@/types/iteration';
import { Select, Card, Button } from 'antd';
import { CarOutlined, SafetyOutlined, AppstoreOutlined, StopOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
  variant?: 'default' | 'large';
}

// 产品图标映射
const productIcons: Record<string, React.ReactNode> = {
  'driving': <CarOutlined style={{ fontSize: 16 }} />,
  'parking': <StopOutlined style={{ fontSize: 16 }} />, // 使用StopOutlined代替ParkingOutlined
  'active-safety': <SafetyOutlined style={{ fontSize: 16 }} />,
  'other': <AppstoreOutlined style={{ fontSize: 16 }} />,
};

const productColors: Record<string, string> = {
  'driving': '#1890ff',
  'parking': '#52c41a',
  'active-safety': '#fa8c16',
  'other': '#8c8c8c',
};

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProduct,
  onSelect,
  variant = 'default',
}) => {
  if (variant === 'large') {
    // 大型卡片式选择器（用于空状态）
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        maxWidth: 1200
      }}>
        {products.map((product) => (
          <Card
            key={product.id}
            hoverable
            style={{ 
              textAlign: 'center',
              cursor: 'pointer',
              borderColor: productColors[product.type] || '#d9d9d9'
            }}
            onClick={() => onSelect(product)}
            styles={{ body: { padding: 24 } }}
          >
            <div style={{ 
              color: productColors[product.type] || '#8c8c8c',
              fontSize: 48,
              marginBottom: 12
            }}>
              {productIcons[product.type]}
            </div>
            <div>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 16,
                marginBottom: 4
              }}>
                {product.name}
              </div>
              {product.description && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#8c8c8c',
                  marginTop: 4
                }}>
                  {product.description}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  // 默认下拉选择器
  const options: SelectProps['options'] = products.map((product) => ({
    value: product.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: productColors[product.type] || '#8c8c8c' }}>
          {productIcons[product.type]}
        </span>
        <span>{product.name}</span>
      </div>
    ),
  }));

  return (
    <Select
      value={selectedProduct?.id || undefined}
      placeholder="选择产品"
      style={{ width: 200 }}
      onChange={(value) => {
        const product = products.find(p => p.id === value);
        if (product) {
          onSelect(product);
        }
      }}
      options={options}
      optionRender={(option) => {
        const product = products.find(p => p.id === option.value);
        if (!product) return option.label;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: productColors[product.type] || '#8c8c8c' }}>
              {productIcons[product.type]}
            </span>
            <span>{product.name}</span>
          </div>
        );
      }}
    />
  );
};

export default ProductSelector;

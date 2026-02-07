/**
 * ConnectionMode - 连接模式指示器
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React from 'react';
import { Alert, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export interface ConnectionModeProps {
  isActive: boolean;
  sourceNode?: {
    id: string;
    label: string;
  };
  connectionType: 'FS' | 'SS' | 'FF' | 'SF';
  onCancel: () => void;
}

export const ConnectionMode: React.FC<ConnectionModeProps> = ({
  isActive,
  sourceNode,
  connectionType,
  onCancel,
}) => {
  if (!isActive || !sourceNode) {
    return null;
  }

  return (
    <Alert
      message={`连接模式：从"${sourceNode.label}"到目标节点 (${connectionType})`}
      type="info"
      showIcon
      closable
      closeIcon={<CloseOutlined />}
      onClose={onCancel}
      action={
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
      }
      style={{
        position: 'fixed',
        top: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        maxWidth: 600,
      }}
      data-testid="connection-mode"
    />
  );
};

/**
 * ConnectionPoints - 连接点组件
 * 
 * 在节点左右两侧显示连接点，用于创建依赖关系
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React from 'react';

export interface ConnectionPointsProps {
  /**
   * 节点ID
   */
  nodeId: string;
  
  /**
   * 是否显示连接点
   * 通常在编辑模式 + (hover或选中) 时显示
   */
  isVisible: boolean;
  
  /**
   * 当前连线模式状态
   */
  connectionMode: {
    lineId: string | null;
    direction: 'from' | 'to';
  };
  
  /**
   * 开始连线回调
   * @param nodeId 节点ID
   * @param direction 连线方向：'from'表示从此节点连出，'to'表示连到此节点
   */
  onStartConnection: (nodeId: string, direction: 'from' | 'to') => void;
  
  /**
   * 完成连线回调
   * @param targetNodeId 目标节点ID
   */
  onCompleteConnection?: (targetNodeId: string) => void;
}

/**
 * ConnectionPoints组件
 */
export const ConnectionPoints: React.FC<ConnectionPointsProps> = ({
  nodeId,
  isVisible,
  connectionMode,
  onStartConnection,
  onCompleteConnection,
}) => {
  if (!isVisible) {
    return null;
  }

  // 判断当前节点的状态
  const isSourceNode = connectionMode.lineId === nodeId;
  const isInConnectionMode = !!connectionMode.lineId;
  const canBeTarget = isInConnectionMode && !isSourceNode;

  /**
   * 左连接点点击（入口）
   * - 不在连线模式时：开始连线，其他节点可连到这里
   * - 在连线模式时：完成连线，作为目标节点
   */
  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (canBeTarget) {
      // 完成连线
      console.log('[ConnectionPoints] ✅ 完成连线（入口）', { 
        from: connectionMode.lineId, 
        to: nodeId 
      });
      onCompleteConnection?.(nodeId);
    } else if (!isInConnectionMode) {
      // 开始连线：其他节点连到这里
      console.log('[ConnectionPoints] 🎯 开始连线（入口）', { 
        nodeId, 
        direction: 'to' 
      });
      onStartConnection(nodeId, 'to');
    }
  };

  /**
   * 右连接点点击（出口）
   * - 不在连线模式时：开始连线，从这里连到其他节点
   * - 在连线模式时：完成连线，作为目标节点
   */
  const handleRightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (canBeTarget) {
      // 完成连线
      console.log('[ConnectionPoints] ✅ 完成连线（出口）', { 
        from: connectionMode.lineId, 
        to: nodeId 
      });
      onCompleteConnection?.(nodeId);
    } else if (!isInConnectionMode) {
      // 开始连线：从这里连到其他节点
      console.log('[ConnectionPoints] 🎯 开始连线（出口）', { 
        nodeId, 
        direction: 'from' 
      });
      onStartConnection(nodeId, 'from');
    }
  };

  // 样式生成函数
  const getPointStyle = (isLeft: boolean): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: '2px solid',
      cursor: 'pointer',
      transition: 'all 0.15s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
      backgroundColor: '#fff',
    };

    // 位置
    if (isLeft) {
      baseStyle.left = -8;
    } else {
      baseStyle.right = -8;
    }

    // 状态样式
    if (canBeTarget) {
      // 目标候选：绿色脉冲
      return {
        ...baseStyle,
        backgroundColor: '#52c41a',
        borderColor: '#52c41a',
        animation: 'pulse 1.5s infinite',
        transform: 'translateY(-50%) scale(1.25)',
        boxShadow: '0 0 0 4px rgba(82, 196, 26, 0.3)',
      };
    } else if (isSourceNode && ((isLeft && connectionMode.direction === 'to') || (!isLeft && connectionMode.direction === 'from'))) {
      // 源节点：主色高亮
      return {
        ...baseStyle,
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        transform: 'translateY(-50%) scale(1.25)',
        boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.3)',
      };
    } else {
      // 默认状态
      return {
        ...baseStyle,
        borderColor: 'rgba(24, 144, 255, 0.6)',
      };
    }
  };

  const getInnerDotStyle = (): React.CSSProperties => {
    if (canBeTarget || isSourceNode) {
      return {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#fff',
      };
    }
    return {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'rgba(24, 144, 255, 0.6)',
    };
  };

  return (
    <>
      {/* 左连接点（入口）*/}
      <div
        style={getPointStyle(true)}
        onClick={handleLeftClick}
        onMouseEnter={(e) => {
          if (!canBeTarget && !isSourceNode) {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#1890ff';
            (e.currentTarget as HTMLElement).style.borderColor = '#1890ff';
          }
        }}
        onMouseLeave={(e) => {
          if (!canBeTarget && !isSourceNode) {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(24, 144, 255, 0.6)';
          }
        }}
        title={canBeTarget ? '点击完成连线' : '点击后，其他节点可连接到这里'}
      >
        <div style={getInnerDotStyle()} />
      </div>

      {/* 右连接点（出口）*/}
      <div
        style={getPointStyle(false)}
        onClick={handleRightClick}
        onMouseEnter={(e) => {
          if (!canBeTarget && !isSourceNode) {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#1890ff';
            (e.currentTarget as HTMLElement).style.borderColor = '#1890ff';
          }
        }}
        onMouseLeave={(e) => {
          if (!canBeTarget && !isSourceNode) {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(24, 144, 255, 0.6)';
          }
        }}
        title={canBeTarget ? '点击完成连线' : '点击后，从这里连接到其他节点'}
      >
        <div style={getInnerDotStyle()} />
      </div>

      {/* 添加CSS动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(82, 196, 26, 0.1);
          }
        }
      `}</style>
    </>
  );
};

export default ConnectionPoints;

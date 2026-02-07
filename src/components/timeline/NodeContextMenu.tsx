/**
 * NodeContextMenu - 节点右键菜单组件
 * 
 * 功能:
 * - 编辑节点
 * - 删除节点
 * - 复制节点
 * - 转换节点类型（Bar ↔ Milestone ↔ Gateway）
 * - 添加依赖关系
 * - 添加到基线
 * - 查看嵌套计划
 * 
 * @version 1.0.0
 * @date 2026-02-07
 * @migrated-from timeline-craft-kit/src/components/timeline/NodeContextMenu.tsx
 * @adapted-to Ant Design Dropdown
 */

import React, { useState, useCallback } from 'react';
import { Dropdown, Modal, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SwapOutlined,
  LinkOutlined,
  PlusOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import type { Line, Baseline } from '@/types/timeplanSchema';

/**
 * NodeContextMenu 组件属性
 */
export interface NodeContextMenuProps {
  /**
   * 子元素（节点渲染器）
   */
  children: React.ReactNode;

  /**
   * 节点数据
   */
  node: Line;

  /**
   * 是否编辑模式
   * @default false
   */
  isEditMode?: boolean;

  /**
   * 是否禁用菜单
   * @default false
   */
  disabled?: boolean;

  /**
   * 可用的基线列表（用于"添加到基线"菜单）
   */
  baselines?: Baseline[];

  /**
   * 编辑节点回调
   */
  onEditNode?: (node: Line) => void;

  /**
   * 删除节点回调
   */
  onDeleteNode?: (nodeId: string) => void;

  /**
   * 复制节点回调
   */
  onCopyNode?: (node: Line) => void;

  /**
   * 转换节点类型回调
   */
  onConvertNodeType?: (nodeId: string, newSchemaId: string) => void;

  /**
   * 添加依赖关系回调
   */
  onAddRelation?: (fromLineId: string) => void;

  /**
   * 添加到基线回调
   */
  onAddToBaseline?: (nodeId: string, baselineId: string) => void;

  /**
   * 查看嵌套计划回调
   */
  onViewNestedPlan?: (nestedPlanId: string) => void;
}

/**
 * NodeContextMenu 组件
 */
export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  children,
  node,
  isEditMode = false,
  disabled = false,
  baselines = [],
  onEditNode,
  onDeleteNode,
  onCopyNode,
  onConvertNodeType,
  onAddRelation,
  onAddToBaseline,
  onViewNestedPlan,
}) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  /**
   * 处理编辑节点
   */
  const handleEdit = useCallback(() => {
    setContextMenuVisible(false);
    onEditNode?.(node);
  }, [node, onEditNode]);

  /**
   * 处理删除节点
   */
  const handleDelete = useCallback(() => {
    setContextMenuVisible(false);
    Modal.confirm({
      title: '删除节点',
      content: `确定要删除节点"${node.label}"吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onDeleteNode?.(node.id);
        message.success('节点已删除');
      },
    });
  }, [node, onDeleteNode]);

  /**
   * 处理复制节点
   */
  const handleCopy = useCallback(() => {
    setContextMenuVisible(false);
    onCopyNode?.(node);
    message.success('节点已复制');
  }, [node, onCopyNode]);

  /**
   * 处理转换节点类型
   */
  const handleConvert = useCallback((newSchemaId: string) => {
    setContextMenuVisible(false);
    const typeNames: Record<string, string> = {
      'bar-schema': '计划单元',
      'milestone-schema': '里程碑',
      'gateway-schema': '网关',
    };
    const newTypeName = typeNames[newSchemaId] || newSchemaId;
    onConvertNodeType?.(node.id, newSchemaId);
    message.success(`已转换为${newTypeName}`);
  }, [node, onConvertNodeType]);

  /**
   * 处理添加依赖关系
   */
  const handleAddRelation = useCallback(() => {
    setContextMenuVisible(false);
    onAddRelation?.(node.id);
    message.info('请点击目标节点的连接点');
  }, [node, onAddRelation]);

  /**
   * 处理添加到基线
   */
  const handleAddToBaseline = useCallback((baselineId: string) => {
    setContextMenuVisible(false);
    const baseline = baselines.find(b => b.id === baselineId);
    onAddToBaseline?.(node.id, baselineId);
    message.success(`已添加到基线"${baseline?.label}"`);
  }, [node, baselines, onAddToBaseline]);

  /**
   * 处理查看嵌套计划
   */
  const handleViewNested = useCallback(() => {
    setContextMenuVisible(false);
    if (node.nestedPlanId) {
      onViewNestedPlan?.(node.nestedPlanId);
    }
  }, [node, onViewNestedPlan]);

  // 如果不是编辑模式或禁用，直接返回子元素
  if (!isEditMode || disabled) {
    return <>{children}</>;
  }

  // 构建菜单项
  const menuItems: MenuProps['items'] = [
    // 编辑节点
    onEditNode && {
      key: 'edit',
      label: '编辑节点',
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    // 复制节点
    onCopyNode && {
      key: 'copy',
      label: '复制节点',
      icon: <CopyOutlined />,
      onClick: handleCopy,
    },
    // 分隔线
    (onEditNode || onCopyNode) && { type: 'divider' },
    // 转换节点类型
    onConvertNodeType && {
      key: 'convert',
      label: '转换类型',
      icon: <SwapOutlined />,
      children: [
        {
          key: 'convert-bar',
          label: '转换为计划单元',
          disabled: node.schemaId === 'bar-schema',
          onClick: () => handleConvert('bar-schema'),
        },
        {
          key: 'convert-milestone',
          label: '转换为里程碑',
          disabled: node.schemaId === 'milestone-schema',
          onClick: () => handleConvert('milestone-schema'),
        },
        {
          key: 'convert-gateway',
          label: '转换为网关',
          disabled: node.schemaId === 'gateway-schema',
          onClick: () => handleConvert('gateway-schema'),
        },
      ],
    },
    // 添加依赖关系
    onAddRelation && {
      key: 'add-relation',
      label: '添加依赖关系',
      icon: <LinkOutlined />,
      onClick: handleAddRelation,
    },
    // 添加到基线
    onAddToBaseline && baselines.length > 0 && {
      key: 'add-to-baseline',
      label: '添加到基线',
      icon: <PlusOutlined />,
      children: baselines.map(baseline => ({
        key: `baseline-${baseline.id}`,
        label: baseline.label,
        onClick: () => handleAddToBaseline(baseline.id),
      })),
    },
    // 分隔线
    (onConvertNodeType || onAddRelation || (onAddToBaseline && baselines.length > 0)) && { type: 'divider' },
    // 查看嵌套计划
    onViewNestedPlan && node.nestedPlanId && {
      key: 'view-nested',
      label: '查看嵌套计划',
      icon: <FolderOpenOutlined />,
      onClick: handleViewNested,
    },
    // 分隔线
    onViewNestedPlan && node.nestedPlanId && { type: 'divider' },
    // 删除节点
    onDeleteNode && {
      key: 'delete',
      label: '删除节点',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleDelete,
    },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['contextMenu']}
      open={contextMenuVisible}
      onOpenChange={setContextMenuVisible}
    >
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenuVisible(true);
        }}
        style={{ display: 'inline-block', width: '100%', height: '100%' }}
      >
        {children}
      </div>
    </Dropdown>
  );
};

export default NodeContextMenu;

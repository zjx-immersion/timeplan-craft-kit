/**
 * MatrixViewV2 - Product×Team矩阵视图
 * 
 * 全新重构：从Timeline×月份 → Product×Team×工作量
 * 
 * @module components/views/MatrixViewV2
 */

import React, { useMemo, useState } from 'react';
import { Button, Space, DatePicker, Select, Card, Statistic, Row, Col, Alert, Modal, message } from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  WarningOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { TimePlan } from '@/types/timeplan';
import type { Product } from '@/types/product';
import type { Team } from '@/types/team';
import type { DateRange, MatrixFilters, LineExtended } from '@/types/matrix';
import { useProduct } from '@/hooks/useProduct';
import { useTeam } from '@/hooks/useTeam';
import { calculateMatrixData } from '@/utils/matrix/calculateMatrix';
import { MatrixTable } from '@/components/matrix/MatrixTable';
import { ProductManagementDialog } from '@/components/matrix/ProductManagementDialog';
import { TeamManagementDialog } from '@/components/matrix/TeamManagementDialog';
import { HEATMAP_LEGEND } from '@/utils/matrix/heatmap';
import { initializeSampleData, shouldInitialize } from '@/utils/matrix/sampleData';
import { enhanceTimePlan, printEnhancementStats } from '@/utils/matrix/dataEnhancer';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export interface MatrixViewV2Props {
  /** 当前选中的plan（用于详情展示） */
  data: TimePlan;
  /** 所有plans（用于矩阵视图显示全量数据） */
  allPlans?: TimePlan[];
  className?: string;
  style?: React.CSSProperties;
}

export const MatrixViewV2: React.FC<MatrixViewV2Props> = ({ data, allPlans, className, style }) => {
  const { products, refreshProducts } = useProduct();
  const { teams, refreshTeams } = useTeam();
  
  const [productDialogVisible, setProductDialogVisible] = useState(false);
  const [teamDialogVisible, setTeamDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ productId: string; teamId: string } | null>(null);
  
  // 时间范围（默认：今年Q1）
  const [timeRange, setTimeRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear(), 2, 31),
  });
  
  // 扩展Line数据（添加productId、teamId和effort）
  // 只使用当前计划的数据，不加载所有计划
  const extendedLines = useMemo<LineExtended[]>(() => {
    // 使用数据增强工具，自动为Line添加Product和Team关联
    const enhancedPlan = enhanceTimePlan(data);
    
    // 在开发环境打印统计信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MatrixViewV2] 当前计划: ${data.name || data.id}`);
      console.log(`[MatrixViewV2] 任务数: ${enhancedPlan.lines.length}`);
      printEnhancementStats(data);
    }
    
    return enhancedPlan.lines;
  }, [data]);
  
  // 计算矩阵数据
  const matrixData = useMemo(() => {
    if (products.length === 0 || teams.length === 0) {
      return {
        cells: new Map(),
        productTotals: new Map(),
        teamTotals: new Map(),
        grandTotal: 0,
        warnings: [],
      };
    }
    
    return calculateMatrixData(extendedLines, products, teams, timeRange);
  }, [extendedLines, products, teams, timeRange]);
  
  // 处理单元格点击
  const handleCellClick = (productId: string, teamId: string) => {
    setSelectedCell({ productId, teamId });
    setDetailDialogVisible(true);
  };
  
  const selectedProduct = products.find(p => p.id === selectedCell?.productId);
  const selectedTeam = teams.find(t => t.id === selectedCell?.teamId);
  const selectedCellData = selectedCell
    ? matrixData.cells.get(`${selectedCell.productId}-${selectedCell.teamId}`)
    : null;
  
  // 初始化示例数据
  const handleInitializeSample = () => {
    try {
      initializeSampleData();
      refreshProducts();
      refreshTeams();
      message.success('示例数据初始化成功！');
    } catch (error) {
      message.error('初始化失败');
      console.error(error);
    }
  };
  
  // 显示空状态
  if (products.length === 0 || teams.length === 0) {
    return (
      <div className={className} style={{ padding: 40, textAlign: 'center', ...style }}>
        <div style={{ fontSize: 16, marginBottom: 24, color: '#999' }}>
          {products.length === 0 && '暂无Product数据'}
          {products.length > 0 && teams.length === 0 && '暂无Team数据'}
        </div>
        <Space>
          <Button
            type="primary"
            icon={<AppstoreOutlined />}
            onClick={() => setProductDialogVisible(true)}
            style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}
          >
            创建Product
          </Button>
          <Button
            type="primary"
            icon={<TeamOutlined />}
            onClick={() => setTeamDialogVisible(true)}
            style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}
          >
            创建Team
          </Button>
          {shouldInitialize() && (
            <Button
              icon={<ThunderboltOutlined />}
              onClick={handleInitializeSample}
            >
              初始化示例数据
            </Button>
          )}
        </Space>
        
        <ProductManagementDialog
          visible={productDialogVisible}
          onClose={() => setProductDialogVisible(false)}
        />
        
        <TeamManagementDialog
          visible={teamDialogVisible}
          onClose={() => setTeamDialogVisible(false)}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ padding: 16, ...style }}>
      {/* 工具栏 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          type="primary"
          icon={<AppstoreOutlined />}
          onClick={() => setProductDialogVisible(true)}
          style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}
        >
          Product管理
        </Button>
        <Button
          type="primary"
          icon={<TeamOutlined />}
          onClick={() => setTeamDialogVisible(true)}
          style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}
        >
          Team管理
        </Button>
        
        <RangePicker
          value={[dayjs(timeRange.start), dayjs(timeRange.end)]}
          onChange={dates => {
            if (dates && dates[0] && dates[1]) {
              setTimeRange({
                start: dates[0].toDate(),
                end: dates[1].toDate(),
              });
            }
          }}
          format="YYYY-MM-DD"
        />
        
        <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
          刷新
        </Button>
      </Space>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Product数量" value={products.length} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Team数量" value={teams.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="总工作量"
              value={matrixData.grandTotal.toFixed(1)}
              suffix="人/天"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="预警数量"
              value={matrixData.warnings.length}
              prefix={<WarningOutlined />}
              styles={{ content: { color: matrixData.warnings.length > 0 ? '#ff4d4f' : undefined } }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图例 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>负载率图例：</span>
        {HEATMAP_LEGEND.map(item => (
          <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: item.color,
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 12 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 预警提示 */}
      {matrixData.warnings.length > 0 && (
        <Alert
          title={`发现 ${matrixData.warnings.length} 个资源预警`}
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {matrixData.warnings.slice(0, 5).map(w => (
                <li key={w.id}>{w.message}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 矩阵表格 */}
      <MatrixTable
        products={products}
        teams={teams}
        matrixData={matrixData}
        onCellClick={handleCellClick}
      />

      {/* 对话框 */}
      <ProductManagementDialog
        visible={productDialogVisible}
        onClose={() => setProductDialogVisible(false)}
      />
      
      <TeamManagementDialog
        visible={teamDialogVisible}
        onClose={() => setTeamDialogVisible(false)}
      />
      
      {/* 单元格详情对话框 - 简化版 */}
      <Modal
        title={`${selectedProduct?.name} × ${selectedTeam?.name}`}
        open={detailDialogVisible}
        onCancel={() => setDetailDialogVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailDialogVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedCellData && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Statistic title="总工作量" value={selectedCellData.effort.toFixed(1)} suffix="人/天" />
              </Col>
              <Col span={8}>
                <Statistic title="任务数" value={selectedCellData.taskCount} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="负载率"
                  value={selectedCellData.loadRate.toFixed(1)}
                  suffix="%"
                  styles={{
                    content: {
                      color:
                        selectedCellData.loadStatus === 'overload'
                          ? '#ff4d4f'
                          : selectedCellData.loadStatus === 'warning'
                          ? '#faad14'
                          : '#52c41a',
                    }
                  }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>按优先级分布:</div>
              <Space>
                <span>P0: {selectedCellData.byPriority.P0.toFixed(1)} 人/天</span>
                <span>P1: {selectedCellData.byPriority.P1.toFixed(1)} 人/天</span>
                <span>P2: {selectedCellData.byPriority.P2.toFixed(1)} 人/天</span>
                <span>P3: {selectedCellData.byPriority.P3.toFixed(1)} 人/天</span>
              </Space>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                任务列表 ({selectedCellData.tasks.length}):
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {selectedCellData.tasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      padding: 8,
                      marginBottom: 8,
                      border: '1px solid #f0f0f0',
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{task.label}</div>
                    <Space size="small" style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        工作量: {task.effort || 1} 人/天
                      </span>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        进度: {task.progress || 0}%
                      </span>
                    </Space>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

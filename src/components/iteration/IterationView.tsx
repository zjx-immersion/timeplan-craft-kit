/**
 * 迭代规划视图（增强版）
 * 
 * 功能:
 * - 完整的迭代矩阵视图
 * - 产品选择
 * - Sprint规划
 * - MR管理和拖拽排期
 * - 依赖关系可视化
 * - TimePlan里程碑/门禁标记
 * 
 * @version 2.0.0
 * @date 2026-02-07
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { TimePlan } from '@/types/timeplanSchema';
import type { Product, ProductType, Team, Module, Iteration, MR, IterationTask, Feature, SSTS } from '@/types/iteration';
import ProductSelector from './ProductSelector';
import IterationMatrix from './IterationMatrix';
import MRSelectorDialog from './MRSelectorDialog';
import MRDetailDialog from './MRDetailDialog';
import IterationWidthSelector, { type IterationWidthLevel } from './IterationWidthSelector';

export interface IterationViewProps {
  data: TimePlan;
  onDataChange?: (data: TimePlan) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// Mock Data（临时数据，后续可从 TimePlan 映射或后端获取）
// ============================================================================

const mockProducts: Product[] = [
  { id: 'prod-driving', name: '行车', type: 'driving', description: '行车域相关功能' },
  { id: 'prod-parking', name: '泊车', type: 'parking', description: '泊车域相关功能' },
  { id: 'prod-safety', name: '主动安全', type: 'active-safety', description: '主动安全相关功能' },
];

const mockTeams: Team[] = [
  { id: 'team-1', name: '感知团队', productId: 'prod-driving' },
  { id: 'team-2', name: '规划团队', productId: 'prod-driving' },
  { id: 'team-3', name: '控制团队', productId: 'prod-driving' },
  { id: 'team-4', name: '泊车算法团队', productId: 'prod-parking' },
  { id: 'team-5', name: 'AEB团队', productId: 'prod-safety' },
];

const mockModules: Module[] = [
  // 感知团队的模块
  { id: 'mod-1-1', name: '视觉感知', teamId: 'team-1', order: 1 },
  { id: 'mod-1-2', name: '雷达感知', teamId: 'team-1', order: 2 },
  { id: 'mod-1-3', name: '融合感知', teamId: 'team-1', order: 3 },
  
  // 规划团队的模块
  { id: 'mod-2-1', name: '行为决策', teamId: 'team-2', order: 1 },
  { id: 'mod-2-2', name: '路径规划', teamId: 'team-2', order: 2 },
  
  // 控制团队的模块
  { id: 'mod-3-1', name: '横向控制', teamId: 'team-3', order: 1 },
  { id: 'mod-3-2', name: '纵向控制', teamId: 'team-3', order: 2 },
  
  // 泊车算法团队的模块
  { id: 'mod-4-1', name: '泊车规划', teamId: 'team-4', order: 1 },
  { id: 'mod-4-2', name: '泊车控制', teamId: 'team-4', order: 2 },
  
  // AEB团队的模块
  { id: 'mod-5-1', name: 'AEB算法', teamId: 'team-5', order: 1 },
];

// 生成迭代数据（每个产品从指定日期开始，每个迭代2周）
function generateIterations(productId: string, startDate: Date, count: number = 6): Iteration[] {
  const iterations: Iteration[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    const iterStartDate = new Date(start);
    iterStartDate.setDate(start.getDate() + i * 14);
    
    const iterEndDate = new Date(iterStartDate);
    iterEndDate.setDate(iterStartDate.getDate() + 13); // 14天，0-13
    
    iterations.push({
      id: `iter-${productId}-${i + 1}`,
      name: `Sprint ${i + 1}`,
      startDate: iterStartDate,
      endDate: iterEndDate,
      duration: 14,
      productId,
      order: i + 1,
    });
  }
  
  return iterations;
}

// Mock MR 数据
const mockFeatures: Feature[] = [
  { id: 'feat-1', name: '智能驾驶功能' },
  { id: 'feat-2', name: '智能泊车功能' },
];

const mockSSTSList: SSTS[] = [
  { id: 'ssts-1-1', name: 'SSTS-001 感知系统', featureId: 'feat-1' },
  { id: 'ssts-1-2', name: 'SSTS-002 规划系统', featureId: 'feat-1' },
  { id: 'ssts-2-1', name: 'SSTS-003 泊车系统', featureId: 'feat-2' },
];

const mockMRs: MR[] = [
  // 感知系统 MRs
  { 
    id: 'mr-1-1-1', 
    name: 'MR-001 车辆检测算法优化', 
    sstsId: 'ssts-1-1',
    estimatedDays: 5,
    priority: 'high',
    status: 'in-progress',
  },
  { 
    id: 'mr-1-1-2', 
    name: 'MR-002 行人检测算法', 
    sstsId: 'ssts-1-1',
    estimatedDays: 3,
    priority: 'medium',
    status: 'todo',
    dependencies: ['mr-1-1-1'],
  },
  { 
    id: 'mr-1-1-3', 
    name: 'MR-003 障碍物融合', 
    sstsId: 'ssts-1-1',
    estimatedDays: 4,
    priority: 'high',
    status: 'todo',
    dependencies: ['mr-1-1-1', 'mr-1-1-2'],
  },
  { 
    id: 'mr-1-1-4', 
    name: 'MR-004 车道线识别', 
    sstsId: 'ssts-1-1',
    estimatedDays: 6,
    priority: 'medium',
    status: 'todo',
  },
  { 
    id: 'mr-1-1-5', 
    name: 'MR-005 交通标志识别', 
    sstsId: 'ssts-1-1',
    estimatedDays: 5,
    priority: 'medium',
    status: 'todo',
  },
  
  // 规划系统 MRs
  { 
    id: 'mr-1-2-1', 
    name: 'MR-006 路径规划算法', 
    sstsId: 'ssts-1-2',
    estimatedDays: 6,
    priority: 'high',
    status: 'done',
  },
  { 
    id: 'mr-1-2-2', 
    name: 'MR-007 行为决策树优化', 
    sstsId: 'ssts-1-2',
    estimatedDays: 4,
    priority: 'high',
    status: 'in-progress',
  },
  { 
    id: 'mr-1-2-3', 
    name: 'MR-008 轨迹预测', 
    sstsId: 'ssts-1-2',
    estimatedDays: 5,
    priority: 'medium',
    status: 'todo',
    dependencies: ['mr-1-2-2'],
  },
  
  // 泊车系统 MRs
  { 
    id: 'mr-2-1-1', 
    name: 'MR-009 泊车位检测', 
    sstsId: 'ssts-2-1',
    estimatedDays: 5,
    priority: 'high',
    status: 'todo',
  },
  { 
    id: 'mr-2-1-2', 
    name: 'MR-010 泊车路径规划', 
    sstsId: 'ssts-2-1',
    estimatedDays: 6,
    priority: 'high',
    status: 'todo',
    dependencies: ['mr-2-1-1'],
  },
];

// Mock 任务数据（示例：已分配的 MR 到模块-迭代）
const mockTasks: IterationTask[] = [
  // 视觉感知模块
  {
    id: 'task-1',
    moduleId: 'mod-1-1',
    iterationId: 'iter-prod-driving-1',
    mrIds: ['mr-1-1-1', 'mr-1-1-4'],
  },
  {
    id: 'task-2',
    moduleId: 'mod-1-1',
    iterationId: 'iter-prod-driving-2',
    mrIds: ['mr-1-1-2', 'mr-1-1-5'],
  },
  
  // 行为决策模块
  {
    id: 'task-3',
    moduleId: 'mod-2-1',
    iterationId: 'iter-prod-driving-1',
    mrIds: ['mr-1-2-2'],
  },
  
  // 泊车规划模块
  {
    id: 'task-4',
    moduleId: 'mod-4-1',
    iterationId: 'iter-prod-parking-1',
    mrIds: ['mr-2-1-1'],
  },
];

// ============================================================================
// 主组件
// ============================================================================

export const IterationView: React.FC<IterationViewProps> = ({
  data,
  onDataChange,
  className,
  style,
}) => {
  // 当前选中的产品
  const [selectedProduct, setSelectedProduct] = useState<Product>(mockProducts[0]);
  
  // 任务数据（模块-迭代的 MR 分配）
  const [tasks, setTasks] = useState<IterationTask[]>(mockTasks);
  
  // 迭代宽度档位
  const [widthLevel, setWidthLevel] = useState<IterationWidthLevel>(2);
  
  // MR 选择对话框状态
  const [mrDialogOpen, setMrDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ moduleId: string; iterationId: string } | null>(null);
  
  // MR 详情对话框状态
  const [mrDetailOpen, setMrDetailOpen] = useState(false);
  const [selectedMR, setSelectedMR] = useState<MR | null>(null);
  
  // 从 TimePlan 数据生成迭代周期
  const iterations = useMemo(() => {
    if (!selectedProduct) return [];
    
    // 从 TimePlan 获取日期范围
    let minDate = new Date();
    let maxDate = new Date();
    let hasValidDates = false;
    
    if (data && data.lines && data.lines.length > 0) {
      try {
        const dates = data.lines.flatMap(line => {
          try {
            return [
              new Date(line.startDate),
              new Date(line.endDate)
            ];
          } catch (e) {
            return [];
          }
        }).filter(d => !isNaN(d.getTime()));
        
        if (dates.length > 0) {
          minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          hasValidDates = true;
        }
      } catch (e) {
        console.error('[IterationView] 处理日期范围失败', e);
      }
    }
    
    if (!hasValidDates) {
      // 使用默认日期范围：当前年份
      const now = new Date();
      minDate = new Date(now.getFullYear(), 0, 1);
      maxDate = new Date(now.getFullYear(), 11, 31);
    }
    
    // 调整到周一作为第一个迭代开始日期
    const firstIterStart = new Date(minDate);
    firstIterStart.setDate(firstIterStart.getDate() - (firstIterStart.getDay() || 7) + 1);
    
    // 计算需要多少个迭代才能覆盖整个时间范围
    const daysDiff = Math.ceil((maxDate.getTime() - firstIterStart.getTime()) / (1000 * 60 * 60 * 24));
    const iterationCount = Math.ceil(daysDiff / 14) + 1;
    
    return generateIterations(selectedProduct.id, firstIterStart, Math.max(iterationCount, 6));
  }, [selectedProduct, data]);
  
  // 获取当前产品的团队和模块
  const teams = useMemo(() => {
    if (!selectedProduct) return [];
    return mockTeams.filter(t => t.productId === selectedProduct.id);
  }, [selectedProduct]);
  
  const modules = useMemo(() => {
    if (teams.length === 0) return [];
    const teamIds = teams.map(t => t.id);
    return mockModules.filter(m => teamIds.includes(m.teamId));
  }, [teams]);
  
  // 处理产品选择
  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);
  
  // 处理单元格点击（添加MR）
  const handleCellClick = useCallback((moduleId: string, iterationId: string) => {
    setSelectedCell({ moduleId, iterationId });
    setMrDialogOpen(true);
  }, []);
  
  // 处理 MR 选择
  const handleMRSelect = useCallback((mrIds: string[]) => {
    if (!selectedCell) return;
    
    // 查找或创建任务
    const existingTaskIndex = tasks.findIndex(
      t => t.moduleId === selectedCell.moduleId && t.iterationId === selectedCell.iterationId
    );
    
    if (existingTaskIndex >= 0) {
      // 更新现有任务，合并 MR
      const updatedTasks = [...tasks];
      const existingMRIds = updatedTasks[existingTaskIndex].mrIds;
      updatedTasks[existingTaskIndex] = {
        ...updatedTasks[existingTaskIndex],
        mrIds: Array.from(new Set([...existingMRIds, ...mrIds])),
      };
      setTasks(updatedTasks);
    } else {
      // 创建新任务
      const newTask: IterationTask = {
        id: `task-${Date.now()}`,
        moduleId: selectedCell.moduleId,
        iterationId: selectedCell.iterationId,
        mrIds,
      };
      setTasks([...tasks, newTask]);
    }
    
    setMrDialogOpen(false);
  }, [selectedCell, tasks]);
  
  // 处理 MR 点击（显示详情）
  const handleMRClick = useCallback((mr: MR) => {
    setSelectedMR(mr);
    setMrDetailOpen(true);
  }, []);
  
  // 处理 MR 移动（拖拽排期）
  const handleMRMove = useCallback((
    mrId: string,
    fromModuleId: string,
    fromIterationId: string,
    toModuleId: string,
    toIterationId: string
  ) => {
    // 从源单元格移除 MR
    const fromTaskIndex = tasks.findIndex(
      t => t.moduleId === fromModuleId && t.iterationId === fromIterationId
    );
    
    if (fromTaskIndex < 0) return;
    
    const updatedTasks = [...tasks];
    const fromTask = { ...updatedTasks[fromTaskIndex] };
    fromTask.mrIds = fromTask.mrIds.filter(id => id !== mrId);
    
    // 如果源任务没有 MR 了，删除任务
    if (fromTask.mrIds.length === 0) {
      updatedTasks.splice(fromTaskIndex, 1);
    } else {
      updatedTasks[fromTaskIndex] = fromTask;
    }
    
    // 添加到目标单元格
    const toTaskIndex = updatedTasks.findIndex(
      t => t.moduleId === toModuleId && t.iterationId === toIterationId
    );
    
    if (toTaskIndex >= 0) {
      // 目标单元格已有任务，添加 MR
      updatedTasks[toTaskIndex] = {
        ...updatedTasks[toTaskIndex],
        mrIds: [...updatedTasks[toTaskIndex].mrIds, mrId],
      };
    } else {
      // 创建新任务
      updatedTasks.push({
        id: `task-${Date.now()}`,
        moduleId: toModuleId,
        iterationId: toIterationId,
        mrIds: [mrId],
      });
    }
    
    setTasks(updatedTasks);
  }, [tasks]);
  
  return (
    <div 
      className={className}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid #e8e8e8',
          background: '#fff',
          padding: '12px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#8c8c8c' }}>
              选择产品查看迭代规划
            </span>
            <ProductSelector
              products={mockProducts}
              selectedProduct={selectedProduct}
              onSelect={handleProductSelect}
            />
          </div>
          
          <IterationWidthSelector
            value={widthLevel}
            onChange={setWidthLevel}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {iterations.length > 0 ? (
          <IterationMatrix
            product={selectedProduct}
            teams={teams}
            modules={modules}
            iterations={iterations}
            timePlan={data}
            tasks={tasks}
            mrs={mockMRs}
            widthLevel={widthLevel}
            onCellClick={handleCellClick}
            onMRClick={handleMRClick}
            onMRMove={handleMRMove}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
              <p>正在加载迭代数据...</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>产品: {selectedProduct?.name || '未选择'}</p>
              <p style={{ fontSize: 14 }}>TimePlan: {data?.title || '未加载'}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* MR 选择对话框 */}
      <MRSelectorDialog
        open={mrDialogOpen}
        onOpenChange={setMrDialogOpen}
        onSelect={handleMRSelect}
        features={mockFeatures}
        sstsList={mockSSTSList}
        mrs={mockMRs}
      />
      
      {/* MR 详情对话框 */}
      <MRDetailDialog
        open={mrDetailOpen}
        onOpenChange={setMrDetailOpen}
        mr={selectedMR}
        allMrs={mockMRs}
      />
    </div>
  );
};

export default IterationView;

/**
 * ModuleIterationView - 按模块分组的迭代规划视图
 * 
 * 功能:
 * - 按产品线（productLine）分组
 * - 按模块（module）二级分组
 * - 显示MR拆解和依赖关系
 * - 可视化依赖关系连线
 * 
 * @version 1.0.0
 * @date 2026-02-08
 */

import React, { useMemo } from 'react';
import { Card, Space, Tag, Progress, Tooltip, Collapse, theme, Empty } from 'antd';
import {
  ClockCircleOutlined,
  FlagOutlined,
  BorderOutlined,
  LinkOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { TimePlan, Line } from '@/types/timeplanSchema';
import { format, differenceInDays } from 'date-fns';

const { Panel } = Collapse;
const { useToken } = theme;

export interface ModuleIterationViewProps {
  data: TimePlan;
  onLineClick?: (line: Line) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface MRItem {
  line: Line;
  dependencies: string[]; // 依赖的line IDs
  dependencyNames: string[]; // 依赖的line名称
  duration?: number;
}

interface ModuleGroup {
  moduleName: string;
  mrs: MRItem[];
}

interface ProductLineGroup {
  productLine: string;
  modules: ModuleGroup[];
}

export const ModuleIterationView: React.FC<ModuleIterationViewProps> = ({
  data,
  onLineClick,
  className,
  style,
}) => {
  const { token } = useToken();

  // 辅助函数：获取类型图标
  const getTypeIcon = (schemaId: string) => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') 
      return <ClockCircleOutlined style={{ color: token.colorPrimary }} />;
    if (schemaId === 'milestone-schema') 
      return <FlagOutlined style={{ color: token.colorSuccess }} />;
    if (schemaId === 'gateway-schema') 
      return <BorderOutlined style={{ color: token.colorWarning }} />;
    return null;
  };

  // 辅助函数：获取类型标签颜色
  const getTypeColor = (schemaId: string): string => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') return 'blue';
    if (schemaId === 'milestone-schema') return 'green';
    if (schemaId === 'gateway-schema') return 'orange';
    return 'default';
  };

  // 辅助函数：获取类型名称
  const getTypeName = (schemaId: string): string => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') return '计划单元';
    if (schemaId === 'milestone-schema') return '里程碑';
    if (schemaId === 'gateway-schema') return '关口';
    return '未知';
  };

  // 辅助函数：计算时长
  const calculateDuration = (line: Line): number | undefined => {
    if (!line.endDate || !line.startDate) return undefined;
    return differenceInDays(new Date(line.endDate), new Date(line.startDate));
  };

  // 辅助函数：获取依赖关系
  const getDependencies = (lineId: string): { ids: string[]; names: string[] } => {
    const depIds = (data.relations || [])
      .filter(rel => rel.toLineId === lineId)
      .map(rel => rel.fromLineId);

    const depNames = depIds.map(depId => {
      const line = data.lines?.find(l => l.id === depId);
      return line?.label || depId;
    });

    return { ids: depIds, names: depNames };
  };

  // 按产品线和模块分组（支持所有lines，自动推断分组）
  const groupedData = useMemo<ProductLineGroup[]>(() => {
    console.log('[ModuleIterationView] 开始分组数据:', {
      totalLines: data.lines?.length || 0,
      totalTimelines: data.timelines?.length || 0,
      planLabel: data.label,
    });

    if (!data.lines || data.lines.length === 0) {
      console.warn('[ModuleIterationView] 没有lines数据');
      return [];
    }

    // 先按产品线分组
    const productLineMap = new Map<string, Map<string, MRItem[]>>();

    data.lines.forEach((line, index) => {
      // 自动推断产品线和模块
      // 优先使用 attributes 中的值，否则使用 timeline 的 category
      let productLine = line.attributes?.productLine;
      let module = line.attributes?.module;

      // 如果没有 productLine，使用 timeline 的 category 或 id
      if (!productLine) {
        const timeline = data.timelines?.find(t => t.id === line.timelineId);
        productLine = timeline?.attributes?.category || timeline?.label || '未分类产品线';
      }

      // 如果没有 module，使用 timeline 的 label 或从 line label 中提取
      if (!module) {
        const timeline = data.timelines?.find(t => t.id === line.timelineId);
        module = timeline?.label || '未分类模块';
      }

      // 调试日志：前5个line的分组信息
      if (index < 5) {
        console.log(`[ModuleIterationView] Line[${index}]:`, {
          id: line.id,
          label: line.label,
          timelineId: line.timelineId,
          productLine,
          module,
          hasModuleAttr: !!line.attributes?.module,
          hasProductLineAttr: !!line.attributes?.productLine,
        });
      }

      if (!productLineMap.has(productLine)) {
        productLineMap.set(productLine, new Map());
      }

      const moduleMap = productLineMap.get(productLine)!;
      if (!moduleMap.has(module)) {
        moduleMap.set(module, []);
      }

      const deps = getDependencies(line.id);
      const mrItem: MRItem = {
        line,
        dependencies: deps.ids,
        dependencyNames: deps.names,
        duration: calculateDuration(line),
      };

      moduleMap.get(module)!.push(mrItem);
    });

    // 转换为数组格式
    const result: ProductLineGroup[] = [];
    console.log('[ModuleIterationView] 产品线分组完成:', {
      productLineCount: productLineMap.size,
      productLines: Array.from(productLineMap.keys()),
    });

    productLineMap.forEach((moduleMap, productLine) => {
      const modules: ModuleGroup[] = [];
      moduleMap.forEach((mrs, moduleName) => {
        modules.push({
          moduleName,
          mrs: mrs.sort((a, b) => {
            // 按开始日期排序
            return new Date(a.line.startDate).getTime() - new Date(b.line.startDate).getTime();
          }),
        });
      });

      result.push({
        productLine,
        modules: modules.sort((a, b) => a.moduleName.localeCompare(b.moduleName)),
      });
    });

    const sortedResult = result.sort((a, b) => a.productLine.localeCompare(b.productLine));

    console.log('[ModuleIterationView] 最终分组结果:', {
      productLineCount: sortedResult.length,
      totalModules: sortedResult.reduce((sum, pl) => sum + pl.modules.length, 0),
      totalMRs: sortedResult.reduce((sum, pl) => 
        sum + pl.modules.reduce((msum, m) => msum + m.mrs.length, 0), 0
      ),
      summary: sortedResult.map(pl => ({
        productLine: pl.productLine,
        moduleCount: pl.modules.length,
        mrCount: pl.modules.reduce((sum, m) => sum + m.mrs.length, 0),
      })),
    });

    return sortedResult;
  }, [data]);

  // 渲染MR卡片
  const renderMRCard = (mr: MRItem, index: number) => {
    const { line, dependencyNames, duration } = mr;
    const progress = line.attributes?.progress || 0;
    const owner = line.attributes?.owner;

    return (
      <Card
        key={line.id}
        size="small"
        hoverable
        onClick={() => onLineClick?.(line)}
        style={{
          marginBottom: 12,
          borderLeft: `4px solid ${token.colorPrimary}`,
          cursor: onLineClick ? 'pointer' : 'default',
        }}
        bodyStyle={{ padding: 12 }}
      >
        <Space orientation="vertical" style={{ width: '100%' }} size={8}>
          {/* 标题行 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Space>
              {getTypeIcon(line.schemaId)}
              <span style={{ fontWeight: 500, fontSize: 14 }}>{line.label}</span>
              <Tag color={getTypeColor(line.schemaId)} style={{ marginLeft: 4 }}>
                {getTypeName(line.schemaId)}
              </Tag>
            </Space>
            {index > 0 && (
              <ArrowRightOutlined 
                style={{ 
                  color: token.colorTextSecondary,
                  fontSize: 16,
                }} 
              />
            )}
          </div>

          {/* 依赖关系 */}
          {dependencyNames.length > 0 && (
            <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
              <LinkOutlined style={{ marginRight: 4 }} />
              依赖: {dependencyNames.map((name, i) => (
                <Tag key={i} color="blue" style={{ marginLeft: 4 }}>
                  {name}
                </Tag>
              ))}
            </div>
          )}

          {/* 详细信息 */}
          <Space size={16} style={{ fontSize: 12 }}>
            {owner && (
              <span>
                <UserOutlined style={{ marginRight: 4, color: token.colorTextSecondary }} />
                {owner}
              </span>
            )}
            {line.startDate && (
              <span>
                <CalendarOutlined style={{ marginRight: 4, color: token.colorTextSecondary }} />
                {format(new Date(line.startDate), 'yyyy-MM-dd')}
                {line.endDate && ` ~ ${format(new Date(line.endDate), 'MM-dd')}`}
              </span>
            )}
            {duration !== undefined && (
              <Tag color="purple">{duration}天</Tag>
            )}
          </Space>

          {/* 进度条 */}
          {progress > 0 && (
            <Progress 
              percent={progress} 
              size="small" 
              status={progress >= 100 ? 'success' : 'active'}
            />
          )}
        </Space>
      </Card>
    );
  };

  // 渲染模块组
  const renderModule = (module: ModuleGroup) => {
    return (
      <div key={module.moduleName} style={{ marginBottom: 24 }}>
        <div
          style={{
            padding: '8px 16px',
            background: token.colorBgTextHover,
            borderRadius: 4,
            marginBottom: 12,
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          📦 {module.moduleName}
          <Tag color="cyan" style={{ marginLeft: 8 }}>
            {module.mrs.length} 个任务
          </Tag>
        </div>

        {/* MR列表 */}
        <div style={{ paddingLeft: 16 }}>
          {module.mrs.map((mr, index) => renderMRCard(mr, index))}
        </div>
      </div>
    );
  };

  if (groupedData.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: 48,
          background: '#fff',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <Empty
          description="暂无计划数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        padding: 16,
        background: '#f5f5f5',
        height: '100%',
        overflow: 'auto',
        ...style,
      }}
      data-testid="module-iteration-view"
    >
      {/* 产品线折叠面板 */}
      <Collapse
        defaultActiveKey={groupedData.map(pl => pl.productLine)}
        expandIconPosition="end"
        style={{ background: 'transparent' }}
      >
        {groupedData.map(productLine => (
          <Panel
            key={productLine.productLine}
            header={
              <Space>
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                  🚀 {productLine.productLine}
                </span>
                <Tag color="blue">
                  {productLine.modules.reduce((sum, m) => sum + m.mrs.length, 0)} 个任务
                </Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ background: '#fff', padding: 16, borderRadius: 4 }}>
              {productLine.modules.map(module => renderModule(module))}
            </div>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default ModuleIterationView;

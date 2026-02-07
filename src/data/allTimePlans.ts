/**
 * 所有 Timeline Plans - v2 Schema-Based
 * 
 * ✅ 已迁移到 v2 格式（TimePlan / Line）
 * ❌ 删除 v1 格式（TimelinePlanData / TimelineNode）
 * 
 * @version 2.1.1
 * @date 2026-01-25
 */

import { TimePlan } from '@/types/timeplanSchema';

// ============================================================================
// 临时：导入 v1 数据用于迁移
// ============================================================================
import { TimelinePlanData, Baseline } from '@/types/timeline';
import { addDays, subMonths, subDays } from 'date-fns';
import { migratePlanDataToTimePlan } from '../../scripts/migrateV1DataToV2';

// Base date set to 3 months ago so nodes are visible in the current view
const baseDate = subMonths(new Date(), 3);

// ============================================================
// Plan 1: 工程效能计划 (原有数据)
// ============================================================
const engineeringBaselines: Baseline[] = [
  {
    id: 'eng-baseline-1',
    date: addDays(baseDate, 90),
    label: 'G1 封版',
    color: 'hsl(0, 84%, 60%)',
  },
  {
    id: 'eng-baseline-2',
    date: addDays(baseDate, 180),
    label: 'V1.0 发布',
    color: 'hsl(142, 76%, 36%)',
  },
  {
    id: 'eng-baseline-3',
    date: addDays(baseDate, 270),
    label: 'G2 封版',
    color: 'hsl(221, 83%, 53%)',
  },
];

const engineeringPlan: TimelinePlanData = {
  id: 'plan-001',
  title: '工程效能计划',
  owner: 'Tech Platform Team',
  createdAt: subDays(new Date(), 30),
  lastAccessTime: subDays(new Date(), 0),
  timelines: [
    {
      id: 'tl-1',
      name: '统一包管理工具 - NTx...',
      owner: 'Kai MAN',
      color: 'primary',
      nodes: [
        { id: 'node-1-1', type: 'bar', label: '统一的软件管理方案和dpam工具POC', startDate: addDays(baseDate, 0), endDate: addDays(baseDate, 60), timelineId: 'tl-1' },
        { id: 'node-1-2', type: 'milestone', label: 'Peanut V1.0', startDate: addDays(baseDate, 70), timelineId: 'tl-1' },
        { id: 'node-1-3', type: 'bar', label: 'NVOS/Zone支持NixPkg', startDate: addDays(baseDate, 100), endDate: addDays(baseDate, 150), timelineId: 'tl-1' },
        { id: 'node-1-4', type: 'gateway', label: 'G1', startDate: addDays(baseDate, 180), timelineId: 'tl-1' },
      ],
    },
    {
      id: 'tl-2',
      name: '统一的服务自动化测试...',
      owner: 'Albert CHENG',
      nodes: [
        { id: 'node-2-1', type: 'bar', label: 'V0.1高昂接口协议', startDate: addDays(baseDate, -20), endDate: addDays(baseDate, 30), timelineId: 'tl-2' },
        { id: 'node-2-2', type: 'bar', label: 'ZoneVDF simulator协作调试', startDate: addDays(baseDate, 60), endDate: addDays(baseDate, 110), timelineId: 'tl-2' },
        { id: 'node-2-3', type: 'milestone', label: 'V2.0', startDate: addDays(baseDate, 130), timelineId: 'tl-2' },
      ],
    },
    {
      id: 'tl-3',
      name: '统一标准开发集成体验...',
      owner: 'Ganggang YU',
      nodes: [
        { id: 'node-3-1', type: 'bar', label: 'NTsapi技术标准', startDate: addDays(baseDate, 80), endDate: addDays(baseDate, 140), timelineId: 'tl-3' },
        { id: 'node-3-2', type: 'bar', label: '对接认管理平台', startDate: addDays(baseDate, 160), endDate: addDays(baseDate, 220), timelineId: 'tl-3' },
        { id: 'node-3-3', type: 'gateway', label: 'G2', startDate: addDays(baseDate, 240), timelineId: 'tl-3' },
      ],
    },
    {
      id: 'tl-4',
      name: '统一的平台发布管理系...',
      owner: 'Haisong ZOU',
      nodes: [
        { id: 'node-4-1', type: 'bar', label: 'V0.2力变型POC', startDate: addDays(baseDate, -40), endDate: addDays(baseDate, 0), timelineId: 'tl-4' },
        { id: 'node-4-2', type: 'bar', label: 'V0.2流水线包服务', startDate: addDays(baseDate, 20), endDate: addDays(baseDate, 80), timelineId: 'tl-4' },
        { id: 'node-4-3', type: 'milestone', label: 'V1.0', startDate: addDays(baseDate, 100), timelineId: 'tl-4' },
        { id: 'node-4-4', type: 'bar', label: 'V1.0发布平台API', startDate: addDays(baseDate, 140), endDate: addDays(baseDate, 210), timelineId: 'tl-4' },
      ],
    },
    {
      id: 'tl-5',
      name: '精准化自研台架',
      owner: 'Qinghua MA',
      nodes: [
        { id: 'node-5-1', type: 'bar', label: '平台自测试用', startDate: addDays(baseDate, 40), endDate: addDays(baseDate, 90), timelineId: 'tl-5' },
        { id: 'node-5-2', type: 'milestone', label: 'CCC验证', startDate: addDays(baseDate, 110), timelineId: 'tl-5' },
        { id: 'node-5-3', type: 'bar', label: 'CI/Zone全车测试', startDate: addDays(baseDate, 160), endDate: addDays(baseDate, 240), timelineId: 'tl-5' },
      ],
    },
    {
      id: 'tl-6',
      name: 'NVOS Simulator/Em...',
      owner: 'Wei wei WANG',
      nodes: [
        { id: 'node-6-1', type: 'bar', label: 'MCU(Cortex-MT) PoC', startDate: addDays(baseDate, 60), endDate: addDays(baseDate, 120), timelineId: 'tl-6' },
        { id: 'node-6-2', type: 'milestone', label: 'MCU V1.0', startDate: addDays(baseDate, 160), timelineId: 'tl-6' },
        { id: 'node-6-3', type: 'bar', label: 'MPU(A55) PoC', startDate: addDays(baseDate, 220), endDate: addDays(baseDate, 280), timelineId: 'tl-6' },
      ],
    },
    {
      id: 'tl-7',
      name: 'AD包计划',
      owner: 'Zhukai xu',
      nodes: [
        { id: 'node-7-1', type: 'bar', label: 'test', startDate: addDays(baseDate, 100), endDate: addDays(baseDate, 160), timelineId: 'tl-7' },
        { id: 'node-7-2', type: 'milestone', label: '工程包', startDate: addDays(baseDate, 140), timelineId: 'tl-7' },
        { id: 'node-7-3', type: 'gateway', label: '正式包', startDate: addDays(baseDate, 280), timelineId: 'tl-7' },
      ],
    },
    {
      id: 'tl-8',
      name: 'NT1.x',
      owner: 'Belle JIN',
      nodes: [
        { id: 'node-8-1', type: 'bar', label: 'MP3.4.0', startDate: addDays(baseDate, 200), endDate: addDays(baseDate, 240), timelineId: 'tl-8' },
        { id: 'node-8-2', type: 'milestone', label: 'Alient.1.2.2', startDate: addDays(baseDate, 250), timelineId: 'tl-8' },
        { id: 'node-8-3', type: 'bar', label: 'Aspen3.4.2', startDate: addDays(baseDate, 260), endDate: addDays(baseDate, 310), timelineId: 'tl-8' },
      ],
    },
    {
      id: 'tl-9',
      name: 'MP3.4.0',
      owner: 'Blue S',
      nodes: [
        { id: 'node-9-1', type: 'gateway', label: 'SW G1', startDate: addDays(baseDate, -10), timelineId: 'tl-9' },
        { id: 'node-9-2', type: 'gateway', label: 'SW G2', startDate: addDays(baseDate, 30), timelineId: 'tl-9' },
        { id: 'node-9-3', type: 'bar', label: '集成阶段', startDate: addDays(baseDate, 40), endDate: addDays(baseDate, 160), timelineId: 'tl-9' },
        { id: 'node-9-4', type: 'gateway', label: 'SW G3', startDate: addDays(baseDate, 140), timelineId: 'tl-9' },
        { id: 'node-9-5', type: 'gateway', label: 'SW G4', startDate: addDays(baseDate, 180), timelineId: 'tl-9' },
        { id: 'node-9-6', type: 'bar', label: 'Mass OTA', startDate: addDays(baseDate, 260), endDate: addDays(baseDate, 320), timelineId: 'tl-9' },
      ],
    },
  ],
  dependencies: [
    { id: 'dep-1', fromNodeId: 'node-1-1', toNodeId: 'node-1-2', type: 'finish-to-start' },
    { id: 'dep-2', fromNodeId: 'node-1-2', toNodeId: 'node-1-3', type: 'finish-to-start' },
    { id: 'dep-3', fromNodeId: 'node-1-3', toNodeId: 'node-1-4', type: 'finish-to-start' },
    { id: 'dep-4', fromNodeId: 'node-4-1', toNodeId: 'node-4-2', type: 'finish-to-start' },
    { id: 'dep-5', fromNodeId: 'node-4-2', toNodeId: 'node-4-3', type: 'finish-to-start' },
    { id: 'dep-6', fromNodeId: 'node-4-3', toNodeId: 'node-4-4', type: 'finish-to-start' },
    { id: 'dep-7', fromNodeId: 'node-2-2', toNodeId: 'node-3-1', type: 'finish-to-start' },
    { id: 'dep-8', fromNodeId: 'node-5-2', toNodeId: 'node-5-3', type: 'finish-to-start' },
    { id: 'dep-9', fromNodeId: 'node-6-2', toNodeId: 'node-6-3', type: 'finish-to-start' },
    { id: 'dep-10', fromNodeId: 'node-9-1', toNodeId: 'node-9-2', type: 'finish-to-start' },
    { id: 'dep-11', fromNodeId: 'node-9-2', toNodeId: 'node-9-3', type: 'finish-to-start' },
    { id: 'dep-12', fromNodeId: 'node-9-3', toNodeId: 'node-9-4', type: 'finish-to-start' },
    { id: 'dep-13', fromNodeId: 'node-9-4', toNodeId: 'node-9-5', type: 'finish-to-start' },
    { id: 'dep-14', fromNodeId: 'node-9-5', toNodeId: 'node-9-6', type: 'finish-to-start' },
  ],
  baselines: engineeringBaselines,
};

// ============================================================
// Plan 2: 车型56D-智能驾驶软件计划 (24个月周期)
// ============================================================
const ad56dBaseDate = subMonths(new Date(), 2); // Start 2 months ago for visibility

const ad56dBaselines: Baseline[] = [
  // 软件门禁 G0-G4
  { id: 'ad-g0', date: addDays(ad56dBaseDate, 30), label: 'G0 需求锁定', color: 'hsl(280, 70%, 50%)' },
  { id: 'ad-g1', date: addDays(ad56dBaseDate, 120), label: 'G1 设计方案', color: 'hsl(280, 70%, 50%)' },
  { id: 'ad-g2', date: addDays(ad56dBaseDate, 210), label: 'G2 研发计划', color: 'hsl(280, 70%, 50%)' },
  { id: 'ad-g3', date: addDays(ad56dBaseDate, 360), label: 'G3 开发90%', color: 'hsl(280, 70%, 50%)' },
  { id: 'ad-g4', date: addDays(ad56dBaseDate, 480), label: 'G4 正式发布', color: 'hsl(280, 70%, 50%)' },
  // 造车里程碑 DV-MP
  { id: 'ad-dv', date: addDays(ad56dBaseDate, 60), label: 'DV 设计验证', color: 'hsl(142, 76%, 36%)' },
  { id: 'ad-et', date: addDays(ad56dBaseDate, 150), label: 'ET 工程试制', color: 'hsl(142, 76%, 36%)' },
  { id: 'ad-pv', date: addDays(ad56dBaseDate, 240), label: 'PV 生产验证', color: 'hsl(142, 76%, 36%)' },
  { id: 'ad-tt', date: addDays(ad56dBaseDate, 330), label: 'TT 工装试制', color: 'hsl(142, 76%, 36%)' },
  { id: 'ad-pp', date: addDays(ad56dBaseDate, 420), label: 'PP 预生产', color: 'hsl(142, 76%, 36%)' },
  { id: 'ad-j1', date: addDays(ad56dBaseDate, 510), label: 'J1 工厂认证', color: 'hsl(142, 76%, 36%)' },
  { id: 'ad-mp', date: addDays(ad56dBaseDate, 600), label: 'MP 量产', color: 'hsl(0, 84%, 60%)' },
];

const ad56dPlan: TimelinePlanData = {
  id: 'plan-002',
  title: '车型56D-智能驾驶软件计划',
  owner: 'AD Software Team',
  createdAt: subDays(new Date(), 60),
  lastAccessTime: subDays(new Date(), 1),
  timelines: [
    {
      id: 'ad-tl-1',
      name: '感知算法',
      owner: '感知算法团队',
      nodes: [
        { id: 'ad-1-1', type: 'bar', label: '需求分析与传感器选型', startDate: addDays(ad56dBaseDate, 0), endDate: addDays(ad56dBaseDate, 45), timelineId: 'ad-tl-1' },
        { id: 'ad-1-2', type: 'bar', label: 'V0.5 传感器适配开发', startDate: addDays(ad56dBaseDate, 50), endDate: addDays(ad56dBaseDate, 110), timelineId: 'ad-tl-1' },
        { id: 'ad-1-3', type: 'gateway', label: 'G1 评审', startDate: addDays(ad56dBaseDate, 120), timelineId: 'ad-tl-1' },
        { id: 'ad-1-4', type: 'bar', label: 'V1.0 算法优化与验证', startDate: addDays(ad56dBaseDate, 130), endDate: addDays(ad56dBaseDate, 200), timelineId: 'ad-tl-1' },
        { id: 'ad-1-5', type: 'milestone', label: 'V1.0 算法冻结', startDate: addDays(ad56dBaseDate, 210), timelineId: 'ad-tl-1' },
        { id: 'ad-1-6', type: 'bar', label: '量产验证与标定', startDate: addDays(ad56dBaseDate, 350), endDate: addDays(ad56dBaseDate, 450), timelineId: 'ad-tl-1' },
      ],
    },
    {
      id: 'ad-tl-2',
      name: '规划决策',
      owner: '规控团队',
      nodes: [
        { id: 'ad-2-1', type: 'bar', label: '架构设计', startDate: addDays(ad56dBaseDate, 20), endDate: addDays(ad56dBaseDate, 80), timelineId: 'ad-tl-2' },
        { id: 'ad-2-2', type: 'bar', label: '功能开发', startDate: addDays(ad56dBaseDate, 90), endDate: addDays(ad56dBaseDate, 180), timelineId: 'ad-tl-2' },
        { id: 'ad-2-3', type: 'bar', label: 'HIL测试', startDate: addDays(ad56dBaseDate, 190), endDate: addDays(ad56dBaseDate, 250), timelineId: 'ad-tl-2' },
        { id: 'ad-2-4', type: 'gateway', label: 'G2 评审', startDate: addDays(ad56dBaseDate, 210), timelineId: 'ad-tl-2' },
        { id: 'ad-2-5', type: 'milestone', label: '功能冻结', startDate: addDays(ad56dBaseDate, 260), timelineId: 'ad-tl-2' },
        { id: 'ad-2-6', type: 'bar', label: '整车路试验证', startDate: addDays(ad56dBaseDate, 380), endDate: addDays(ad56dBaseDate, 470), timelineId: 'ad-tl-2' },
      ],
    },
    {
      id: 'ad-tl-3',
      name: '地图定位',
      owner: '定位团队',
      nodes: [
        { id: 'ad-3-1', type: 'bar', label: '高精地图对接', startDate: addDays(ad56dBaseDate, 40), endDate: addDays(ad56dBaseDate, 120), timelineId: 'ad-tl-3' },
        { id: 'ad-3-2', type: 'bar', label: '定位算法优化', startDate: addDays(ad56dBaseDate, 130), endDate: addDays(ad56dBaseDate, 220), timelineId: 'ad-tl-3' },
        { id: 'ad-3-3', type: 'gateway', label: 'G3 验收', startDate: addDays(ad56dBaseDate, 360), timelineId: 'ad-tl-3' },
        { id: 'ad-3-4', type: 'bar', label: '量产适配', startDate: addDays(ad56dBaseDate, 400), endDate: addDays(ad56dBaseDate, 500), timelineId: 'ad-tl-3' },
      ],
    },
    {
      id: 'ad-tl-4',
      name: '系统集成',
      owner: '集成团队',
      nodes: [
        { id: 'ad-4-1', type: 'bar', label: '硬件选型与评估', startDate: addDays(ad56dBaseDate, 0), endDate: addDays(ad56dBaseDate, 50), timelineId: 'ad-tl-4' },
        { id: 'ad-4-2', type: 'bar', label: 'SOC适配开发', startDate: addDays(ad56dBaseDate, 60), endDate: addDays(ad56dBaseDate, 150), timelineId: 'ad-tl-4' },
        { id: 'ad-4-3', type: 'bar', label: '整车联调', startDate: addDays(ad56dBaseDate, 280), endDate: addDays(ad56dBaseDate, 380), timelineId: 'ad-tl-4' },
        { id: 'ad-4-4', type: 'milestone', label: 'SOP 验收', startDate: addDays(ad56dBaseDate, 500), timelineId: 'ad-tl-4' },
      ],
    },
    {
      id: 'ad-tl-5',
      name: 'OTA升级',
      owner: 'OTA团队',
      nodes: [
        { id: 'ad-5-1', type: 'bar', label: '增量方案设计', startDate: addDays(ad56dBaseDate, 100), endDate: addDays(ad56dBaseDate, 180), timelineId: 'ad-tl-5' },
        { id: 'ad-5-2', type: 'bar', label: '安全验证', startDate: addDays(ad56dBaseDate, 200), endDate: addDays(ad56dBaseDate, 280), timelineId: 'ad-tl-5' },
        { id: 'ad-5-3', type: 'milestone', label: '灰度发布', startDate: addDays(ad56dBaseDate, 420), timelineId: 'ad-tl-5' },
        { id: 'ad-5-4', type: 'bar', label: '批量OTA推送', startDate: addDays(ad56dBaseDate, 450), endDate: addDays(ad56dBaseDate, 550), timelineId: 'ad-tl-5' },
      ],
    },
    {
      id: 'ad-tl-6',
      name: '功能安全',
      owner: '安全团队',
      nodes: [
        { id: 'ad-6-1', type: 'bar', label: 'FMEA分析', startDate: addDays(ad56dBaseDate, 30), endDate: addDays(ad56dBaseDate, 100), timelineId: 'ad-tl-6' },
        { id: 'ad-6-2', type: 'bar', label: 'ASIL认证', startDate: addDays(ad56dBaseDate, 150), endDate: addDays(ad56dBaseDate, 280), timelineId: 'ad-tl-6' },
        { id: 'ad-6-3', type: 'milestone', label: '功能安全报告', startDate: addDays(ad56dBaseDate, 400), timelineId: 'ad-tl-6' },
      ],
    },
  ],
  dependencies: [
    // 感知算法内部依赖
    { id: 'ad-dep-1', fromNodeId: 'ad-1-1', toNodeId: 'ad-1-2', type: 'finish-to-start' },
    { id: 'ad-dep-2', fromNodeId: 'ad-1-2', toNodeId: 'ad-1-3', type: 'finish-to-start' },
    { id: 'ad-dep-3', fromNodeId: 'ad-1-3', toNodeId: 'ad-1-4', type: 'finish-to-start' },
    { id: 'ad-dep-4', fromNodeId: 'ad-1-4', toNodeId: 'ad-1-5', type: 'finish-to-start' },
    // 规划决策内部依赖
    { id: 'ad-dep-5', fromNodeId: 'ad-2-1', toNodeId: 'ad-2-2', type: 'finish-to-start' },
    { id: 'ad-dep-6', fromNodeId: 'ad-2-2', toNodeId: 'ad-2-3', type: 'finish-to-start' },
    { id: 'ad-dep-7', fromNodeId: 'ad-2-3', toNodeId: 'ad-2-5', type: 'finish-to-start' },
    // 跨团队依赖
    { id: 'ad-dep-8', fromNodeId: 'ad-1-3', toNodeId: 'ad-2-2', type: 'finish-to-start' }, // 感知G1 → 规控功能开发
    { id: 'ad-dep-9', fromNodeId: 'ad-2-4', toNodeId: 'ad-3-3', type: 'finish-to-start' }, // 规控G2 → 定位G3
    { id: 'ad-dep-10', fromNodeId: 'ad-4-3', toNodeId: 'ad-5-3', type: 'finish-to-start' }, // 整车联调 → 灰度发布
    { id: 'ad-dep-11', fromNodeId: 'ad-6-2', toNodeId: 'ad-4-4', type: 'finish-to-start' }, // ASIL认证 → SOP验收
  ],
  baselines: ad56dBaselines,
};

// ============================================================
// Plan 3: CX11-智能座舱交付计划 (18个月周期)
// ============================================================
const cx11BaseDate = subMonths(new Date(), 1); // Start 1 month ago

const cx11Baselines: Baseline[] = [
  // 软件门禁 G0-G4
  { id: 'cx-g0', date: addDays(cx11BaseDate, 20), label: 'G0 需求锁定', color: 'hsl(280, 70%, 50%)' },
  { id: 'cx-g1', date: addDays(cx11BaseDate, 90), label: 'G1 设计方案', color: 'hsl(280, 70%, 50%)' },
  { id: 'cx-g2', date: addDays(cx11BaseDate, 165), label: 'G2 研发计划', color: 'hsl(280, 70%, 50%)' },
  { id: 'cx-g3', date: addDays(cx11BaseDate, 300), label: 'G3 开发90%', color: 'hsl(280, 70%, 50%)' },
  { id: 'cx-g4', date: addDays(cx11BaseDate, 400), label: 'G4 正式发布', color: 'hsl(280, 70%, 50%)' },
  // 造车里程碑 DV-MP
  { id: 'cx-dv', date: addDays(cx11BaseDate, 45), label: 'DV 设计验证', color: 'hsl(142, 76%, 36%)' },
  { id: 'cx-et', date: addDays(cx11BaseDate, 120), label: 'ET 工程试制', color: 'hsl(142, 76%, 36%)' },
  { id: 'cx-pv', date: addDays(cx11BaseDate, 195), label: 'PV 生产验证', color: 'hsl(142, 76%, 36%)' },
  { id: 'cx-tt', date: addDays(cx11BaseDate, 270), label: 'TT 工装试制', color: 'hsl(142, 76%, 36%)' },
  { id: 'cx-pp', date: addDays(cx11BaseDate, 345), label: 'PP 预生产', color: 'hsl(142, 76%, 36%)' },
  { id: 'cx-j1', date: addDays(cx11BaseDate, 420), label: 'J1 工厂认证', color: 'hsl(142, 76%, 36%)' },
  { id: 'cx-mp', date: addDays(cx11BaseDate, 495), label: 'MP 量产', color: 'hsl(0, 84%, 60%)' },
];

const cx11Plan: TimelinePlanData = {
  id: 'plan-003',
  title: 'CX11-智能座舱交付计划',
  owner: 'Cockpit Team',
  createdAt: subDays(new Date(), 45),
  lastAccessTime: subDays(new Date(), 2),
  timelines: [
    {
      id: 'cx-tl-1',
      name: 'HMI设计',
      owner: 'UX设计团队',
      nodes: [
        { id: 'cx-1-1', type: 'bar', label: '交互原型设计', startDate: addDays(cx11BaseDate, 0), endDate: addDays(cx11BaseDate, 40), timelineId: 'cx-tl-1' },
        { id: 'cx-1-2', type: 'bar', label: '视觉设计', startDate: addDays(cx11BaseDate, 45), endDate: addDays(cx11BaseDate, 100), timelineId: 'cx-tl-1' },
        { id: 'cx-1-3', type: 'bar', label: '动效开发', startDate: addDays(cx11BaseDate, 110), endDate: addDays(cx11BaseDate, 160), timelineId: 'cx-tl-1' },
        { id: 'cx-1-4', type: 'milestone', label: '用户测试完成', startDate: addDays(cx11BaseDate, 180), timelineId: 'cx-tl-1' },
      ],
    },
    {
      id: 'cx-tl-2',
      name: '应用开发',
      owner: '应用团队',
      nodes: [
        { id: 'cx-2-1', type: 'bar', label: '导航App', startDate: addDays(cx11BaseDate, 50), endDate: addDays(cx11BaseDate, 130), timelineId: 'cx-tl-2' },
        { id: 'cx-2-2', type: 'bar', label: '多媒体App', startDate: addDays(cx11BaseDate, 80), endDate: addDays(cx11BaseDate, 160), timelineId: 'cx-tl-2' },
        { id: 'cx-2-3', type: 'bar', label: '语音助手集成', startDate: addDays(cx11BaseDate, 170), endDate: addDays(cx11BaseDate, 250), timelineId: 'cx-tl-2' },
        { id: 'cx-2-4', type: 'milestone', label: 'OTA包发布', startDate: addDays(cx11BaseDate, 350), timelineId: 'cx-tl-2' },
      ],
    },
    {
      id: 'cx-tl-3',
      name: '系统平台',
      owner: '平台团队',
      nodes: [
        { id: 'cx-3-1', type: 'bar', label: 'Android适配', startDate: addDays(cx11BaseDate, 20), endDate: addDays(cx11BaseDate, 90), timelineId: 'cx-tl-3' },
        { id: 'cx-3-2', type: 'bar', label: '系统性能优化', startDate: addDays(cx11BaseDate, 100), endDate: addDays(cx11BaseDate, 180), timelineId: 'cx-tl-3' },
        { id: 'cx-3-3', type: 'bar', label: '安全加固', startDate: addDays(cx11BaseDate, 200), endDate: addDays(cx11BaseDate, 280), timelineId: 'cx-tl-3' },
        { id: 'cx-3-4', type: 'gateway', label: '平台封版', startDate: addDays(cx11BaseDate, 300), timelineId: 'cx-tl-3' },
      ],
    },
    {
      id: 'cx-tl-4',
      name: '车机互联',
      owner: '互联团队',
      nodes: [
        { id: 'cx-4-1', type: 'bar', label: '手机映射', startDate: addDays(cx11BaseDate, 60), endDate: addDays(cx11BaseDate, 140), timelineId: 'cx-tl-4' },
        { id: 'cx-4-2', type: 'bar', label: '远程控制', startDate: addDays(cx11BaseDate, 150), endDate: addDays(cx11BaseDate, 230), timelineId: 'cx-tl-4' },
        { id: 'cx-4-3', type: 'bar', label: '数据同步', startDate: addDays(cx11BaseDate, 240), endDate: addDays(cx11BaseDate, 320), timelineId: 'cx-tl-4' },
        { id: 'cx-4-4', type: 'milestone', label: '互联验收', startDate: addDays(cx11BaseDate, 380), timelineId: 'cx-tl-4' },
      ],
    },
    {
      id: 'cx-tl-5',
      name: '语音交互',
      owner: '语音团队',
      nodes: [
        { id: 'cx-5-1', type: 'bar', label: '唤醒词训练', startDate: addDays(cx11BaseDate, 30), endDate: addDays(cx11BaseDate, 100), timelineId: 'cx-tl-5' },
        { id: 'cx-5-2', type: 'bar', label: 'NLU优化', startDate: addDays(cx11BaseDate, 110), endDate: addDays(cx11BaseDate, 200), timelineId: 'cx-tl-5' },
        { id: 'cx-5-3', type: 'bar', label: '离线能力开发', startDate: addDays(cx11BaseDate, 210), endDate: addDays(cx11BaseDate, 290), timelineId: 'cx-tl-5' },
        { id: 'cx-5-4', type: 'milestone', label: '语音发布', startDate: addDays(cx11BaseDate, 320), timelineId: 'cx-tl-5' },
      ],
    },
    {
      id: 'cx-tl-6',
      name: '测试验证',
      owner: '测试团队',
      nodes: [
        { id: 'cx-6-1', type: 'bar', label: '功能测试', startDate: addDays(cx11BaseDate, 100), endDate: addDays(cx11BaseDate, 180), timelineId: 'cx-tl-6' },
        { id: 'cx-6-2', type: 'bar', label: '性能测试', startDate: addDays(cx11BaseDate, 190), endDate: addDays(cx11BaseDate, 270), timelineId: 'cx-tl-6' },
        { id: 'cx-6-3', type: 'bar', label: '整车验证', startDate: addDays(cx11BaseDate, 280), endDate: addDays(cx11BaseDate, 370), timelineId: 'cx-tl-6' },
        { id: 'cx-6-4', type: 'gateway', label: 'SOP认证', startDate: addDays(cx11BaseDate, 400), timelineId: 'cx-tl-6' },
      ],
    },
  ],
  dependencies: [
    // HMI设计内部
    { id: 'cx-dep-1', fromNodeId: 'cx-1-1', toNodeId: 'cx-1-2', type: 'finish-to-start' },
    { id: 'cx-dep-2', fromNodeId: 'cx-1-2', toNodeId: 'cx-1-3', type: 'finish-to-start' },
    { id: 'cx-dep-3', fromNodeId: 'cx-1-3', toNodeId: 'cx-1-4', type: 'finish-to-start' },
    // 系统平台内部
    { id: 'cx-dep-4', fromNodeId: 'cx-3-1', toNodeId: 'cx-3-2', type: 'finish-to-start' },
    { id: 'cx-dep-5', fromNodeId: 'cx-3-2', toNodeId: 'cx-3-3', type: 'finish-to-start' },
    { id: 'cx-dep-6', fromNodeId: 'cx-3-3', toNodeId: 'cx-3-4', type: 'finish-to-start' },
    // 跨团队依赖
    { id: 'cx-dep-7', fromNodeId: 'cx-1-2', toNodeId: 'cx-2-1', type: 'finish-to-start' }, // 视觉设计 → 导航App
    { id: 'cx-dep-8', fromNodeId: 'cx-3-4', toNodeId: 'cx-2-4', type: 'finish-to-start' }, // 平台封版 → OTA发布
    { id: 'cx-dep-9', fromNodeId: 'cx-5-2', toNodeId: 'cx-2-3', type: 'finish-to-start' }, // NLU优化 → 语音助手集成
    { id: 'cx-dep-10', fromNodeId: 'cx-6-3', toNodeId: 'cx-4-4', type: 'finish-to-start' }, // 整车验证 → 互联验收
  ],
  baselines: cx11Baselines,
};

// ============================================================
// Export all Time Plans - v2 Format ✅
// ============================================================

// v1 Plans（待迁移）
// ============================================================
// Plan 4: 嵌套计划示例
// ============================================================
import { nestedPlanExampleData } from './nestedPlanExample';

const v1Plans: TimelinePlanData[] = [
  engineeringPlan,
  ad56dPlan,
  cx11Plan,
  nestedPlanExampleData, // ✅ 恢复第4个计划
];

// ============================================================
// Plan 5: Orion X 智能驾驶平台 2026 年度计划（完整版 v2）
// ============================================================
import { orionXTimePlan } from './orionXTimePlan';

// ✅ 迁移：v1 → v2
console.log('[allTimePlans] 🔄 迁移 v1 数据到 v2 格式...');
const migratedPlans: TimePlan[] = v1Plans.map(v1Plan => migratePlanDataToTimePlan(v1Plan));
console.log(`[allTimePlans] ✅ 迁移完成: ${migratedPlans.length} 个计划`);

// ✅ 导出：v2 格式
export const allTimePlans: TimePlan[] = [
  ...migratedPlans,
  orionXTimePlan, // ✅ Orion X 智能驾驶平台 2026 年度计划（完整版 v3）
];

export const getTimePlanById = (id: string): TimePlan | undefined => {
  return allTimePlans.find(plan => plan.id === id);
};

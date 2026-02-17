/**
 * Dependency 数据转换器
 */

import { Dependency } from '@/types/timeline';
import { DependencyResponse, CreateDependencyRequest } from '../types/backend';

const DEPENDENCY_TYPE_MAP = {
  'finish-to-start': 'FS',
  'start-to-start': 'SS',
  'finish-to-finish': 'FF',
  'start-to-finish': 'SF',
} as const;

const REVERSE_MAP = {
  'FS': 'finish-to-start',
  'SS': 'start-to-start',
  'FF': 'finish-to-finish',
  'SF': 'start-to-finish',
} as const;

export function transformDependencyFromBackend(dep: DependencyResponse): Dependency {
  return {
    id: dep.id,
    fromNodeId: dep.fromNodeId,
    toNodeId: dep.toNodeId,
    type: REVERSE_MAP[dep.type],
  };
}

export function transformDependencyToBackend(dep: Partial<Dependency>): Partial<CreateDependencyRequest> {
  return {
    fromNodeId: dep.fromNodeId,
    toNodeId: dep.toNodeId,
    type: dep.type ? DEPENDENCY_TYPE_MAP[dep.type] : undefined,
  };
}

export function transformDependenciesFromBackend(deps: DependencyResponse[]): Dependency[] {
  return deps.map(transformDependencyFromBackend);
}

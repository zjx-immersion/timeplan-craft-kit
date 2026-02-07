/**
 * useUndoRedo - 撤销/重做 Hook
 * 
 * 📋 迁移信息:
 * - 原文件: src/hooks/useUndoRedo.ts
 * - 迁移日期: 2026-02-03
 * - 功能: 状态历史管理，支持撤销/重做
 * 
 * 🎯 功能:
 * - 撤销/重做操作
 * - 历史记录管理
 * - 保存/重置功能
 * - 变更检测
 */

import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions<T> {
  maxHistorySize?: number;
}

interface UseUndoRedoResult<T> {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasChanges: boolean;
  save: () => void;
  reset: () => void;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions<T> = {}
): UseUndoRedoResult<T> {
  const { maxHistorySize = 50 } = options;
  
  const [state, setStateInternal] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const savedStateRef = useRef<T>(initialState);
  
  const setState = useCallback((newState: T) => {
    setStateInternal(prevState => {
      // 添加当前状态到历史记录
      setHistory(prev => {
        const newHistory = [...prev, prevState];
        // Limit history size
        if (newHistory.length > maxHistorySize) {
          return newHistory.slice(-maxHistorySize);
        }
        return newHistory;
      });
      setFuture([]); // Clear redo stack on new change
      return newState;
    });
  }, [maxHistorySize]);
  
  const undo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) return prevHistory;
      
      const previous = prevHistory[prevHistory.length - 1];
      const newHistory = prevHistory.slice(0, -1);
      
      setStateInternal(prevState => {
        setFuture(prev => [prevState, ...prev]);
        return previous;
      });
      
      return newHistory;
    });
  }, []);
  
  const redo = useCallback(() => {
    setFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture;
      
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);
      
      setStateInternal(prevState => {
        setHistory(prev => [...prev, prevState]);
        return next;
      });
      
      return newFuture;
    });
  }, []);
  
  const save = useCallback(() => {
    savedStateRef.current = state;
    // Clear history after save
    setHistory([]);
    setFuture([]);
  }, [state]);
  
  const reset = useCallback(() => {
    setStateInternal(savedStateRef.current);
    setHistory([]);
    setFuture([]);
  }, []);
  
  const hasChanges = JSON.stringify(state) !== JSON.stringify(savedStateRef.current);
  
  return {
    state,
    setState,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    hasChanges,
    save,
    reset,
  };
}

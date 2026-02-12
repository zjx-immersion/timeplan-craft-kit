/**
 * 用户偏好设置管理器
 * 
 * 功能：
 * - 保存和加载用户偏好设置
 * - 基于localStorage持久化
 * - 支持导入/导出配置
 * - 支持配置版本控制
 * 
 * @version 1.0.0
 */

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  /** 配置版本 */
  version: string;
  
  /** 视图设置 */
  view: {
    /** 默认视图类型 */
    defaultView: 'matrix' | 'gantt' | 'table';
    /** 矩阵视图设置 */
    matrix: {
      /** 是否显示热力图 */
      showHeatmap: boolean;
      /** 是否显示里程碑 */
      showMilestones: boolean;
      /** 是否显示门禁 */
      showGateways: boolean;
      /** 单元格尺寸 */
      cellSize: 'compact' | 'normal' | 'large';
    };
    /** 甘特图设置 */
    gantt: {
      /** 是否显示关系线 */
      showRelations: boolean;
      /** 是否显示关键路径 */
      showCriticalPath: boolean;
      /** 是否显示今日线 */
      showTodayLine: boolean;
      /** 时间缩放级别 */
      timeScale: 'day' | 'week' | 'month';
    };
    /** 表格视图设置 */
    table: {
      /** 显示的列 */
      visibleColumns: string[];
      /** 每页显示数量 */
      pageSize: number;
    };
  };
  
  /** 导出设置 */
  export: {
    /** 默认导出格式 */
    defaultFormat: 'excel' | 'png' | 'pdf';
    /** Excel导出配置 */
    excel: {
      includeTasks: boolean;
      includeMilestones: boolean;
      includeGateways: boolean;
    };
    /** PNG导出配置 */
    png: {
      quality: number;
      scale: number;
      backgroundColor: string;
    };
    /** PDF导出配置 */
    pdf: {
      orientation: 'portrait' | 'landscape';
      format: 'a4' | 'a3' | 'letter';
      fitToPage: boolean;
    };
  };
  
  /** 编辑器设置 */
  editor: {
    /** 是否自动保存 */
    autoSave: boolean;
    /** 自动保存间隔（秒） */
    autoSaveInterval: number;
    /** 撤销步数限制 */
    maxUndoSteps: number;
  };
  
  /** 主题设置 */
  theme: {
    /** 主题模式 */
    mode: 'light' | 'dark' | 'auto';
    /** 主色调 */
    primaryColor: string;
  };
  
  /** 通知设置 */
  notifications: {
    /** 是否启用通知 */
    enabled: boolean;
    /** 是否显示成功消息 */
    showSuccess: boolean;
    /** 是否显示警告消息 */
    showWarning: boolean;
  };
}

/**
 * 默认配置
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  version: '1.0.0',
  view: {
    defaultView: 'matrix',
    matrix: {
      showHeatmap: true,
      showMilestones: true,
      showGateways: true,
      cellSize: 'normal',
    },
    gantt: {
      showRelations: true,
      showCriticalPath: false,
      showTodayLine: true,
      timeScale: 'week',
    },
    table: {
      visibleColumns: ['name', 'timeline', 'startDate', 'endDate', 'owner', 'status'],
      pageSize: 20,
    },
  },
  export: {
    defaultFormat: 'excel',
    excel: {
      includeTasks: true,
      includeMilestones: true,
      includeGateways: true,
    },
    png: {
      quality: 0.95,
      scale: 2,
      backgroundColor: '#ffffff',
    },
    pdf: {
      orientation: 'landscape',
      format: 'a4',
      fitToPage: true,
    },
  },
  editor: {
    autoSave: true,
    autoSaveInterval: 30,
    maxUndoSteps: 50,
  },
  theme: {
    mode: 'light',
    primaryColor: '#1890ff',
  },
  notifications: {
    enabled: true,
    showSuccess: true,
    showWarning: true,
  },
};

/**
 * 存储键名
 */
const STORAGE_KEY = 'timeplan-craft-user-preferences';

/**
 * 用户偏好设置管理器类
 */
class UserPreferencesManagerClass {
  private preferences: UserPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
  }

  /**
   * 从localStorage加载配置
   */
  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认配置，确保新增字段有默认值
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.error('[UserPreferences] 加载配置失败:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * 合并用户配置与默认配置
   */
  private mergeWithDefaults(userPrefs: Partial<UserPreferences>): UserPreferences {
    return {
      ...DEFAULT_PREFERENCES,
      ...userPrefs,
      view: {
        ...DEFAULT_PREFERENCES.view,
        ...userPrefs.view,
        matrix: {
          ...DEFAULT_PREFERENCES.view.matrix,
          ...userPrefs.view?.matrix,
        },
        gantt: {
          ...DEFAULT_PREFERENCES.view.gantt,
          ...userPrefs.view?.gantt,
        },
        table: {
          ...DEFAULT_PREFERENCES.view.table,
          ...userPrefs.view?.table,
        },
      },
      export: {
        ...DEFAULT_PREFERENCES.export,
        ...userPrefs.export,
        excel: {
          ...DEFAULT_PREFERENCES.export.excel,
          ...userPrefs.export?.excel,
        },
        png: {
          ...DEFAULT_PREFERENCES.export.png,
          ...userPrefs.export?.png,
        },
        pdf: {
          ...DEFAULT_PREFERENCES.export.pdf,
          ...userPrefs.export?.pdf,
        },
      },
      editor: {
        ...DEFAULT_PREFERENCES.editor,
        ...userPrefs.editor,
      },
      theme: {
        ...DEFAULT_PREFERENCES.theme,
        ...userPrefs.theme,
      },
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...userPrefs.notifications,
      },
    };
  }

  /**
   * 保存配置到localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
      console.log('[UserPreferences] 配置已保存');
    } catch (error) {
      console.error('[UserPreferences] 保存配置失败:', error);
    }
  }

  /**
   * 获取完整配置
   */
  public getAll(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * 获取指定路径的配置
   */
  public get<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferences[key];
  }

  /**
   * 更新配置
   */
  public update(updates: Partial<UserPreferences>): void {
    this.preferences = this.mergeWithDefaults({
      ...this.preferences,
      ...updates,
    });
    this.savePreferences();
  }

  /**
   * 更新指定路径的配置
   */
  public set<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.preferences[key] = value;
    this.savePreferences();
  }

  /**
   * 重置为默认配置
   */
  public reset(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
    console.log('[UserPreferences] 已重置为默认配置');
  }

  /**
   * 导出配置为JSON字符串
   */
  public exportToJson(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * 从JSON字符串导入配置
   */
  public importFromJson(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      this.preferences = this.mergeWithDefaults(parsed);
      this.savePreferences();
      console.log('[UserPreferences] 配置导入成功');
      return true;
    } catch (error) {
      console.error('[UserPreferences] 配置导入失败:', error);
      return false;
    }
  }

  /**
   * 下载配置文件
   */
  public downloadConfig(): void {
    const json = this.exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timeplan-preferences-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[UserPreferences] 配置文件已下载');
  }

  /**
   * 从文件上传导入配置
   */
  public async uploadConfig(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      return this.importFromJson(text);
    } catch (error) {
      console.error('[UserPreferences] 文件读取失败:', error);
      return false;
    }
  }
}

/**
 * 单例实例
 */
export const UserPreferencesManager = new UserPreferencesManagerClass();

/**
 * 导出默认配置（用于测试和重置）
 */
export { DEFAULT_PREFERENCES };

export default UserPreferencesManager;

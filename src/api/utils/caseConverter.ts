/**
 * 命名风格转换工具
 * 
 * 前端使用 camelCase，后端使用 snake_case
 * 需要在 API 调用时进行相互转换
 */

/**
 * 深度转换对象的键名：snake_case -> camelCase
 * @param obj 要转换的对象
 * @returns 转换后的对象
 */
export function keysToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  }

  return Object.keys(obj).reduce((result, key) => {
    // 转换键名：snake_case -> camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = keysToCamel(obj[key]);
    return result;
  }, {} as any);
}

/**
 * 深度转换对象的键名：camelCase -> snake_case
 * @param obj 要转换的对象
 * @returns 转换后的对象
 */
export function keysToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  }

  return Object.keys(obj).reduce((result, key) => {
    // 转换键名：camelCase -> snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = keysToSnake(obj[key]);
    return result;
  }, {} as any);
}

/**
 * 转换单个字符串：snake_case -> camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 转换单个字符串：camelCase -> snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// 简单的内存缓存实现
class Cache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 60 * 1000; // 默认缓存时间为1分钟
  }

  // 设置缓存
  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  // 获取缓存
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  // 删除缓存
  delete(key) {
    this.cache.delete(key);
  }

  // 清除所有缓存
  clear() {
    this.cache.clear();
  }

  // 生成缓存键
  generateKey(prefix, params) {
    const paramString = JSON.stringify(params || {});
    return `${prefix}:${paramString}`;
  }
}

// 导出单例实例
module.exports = new Cache();
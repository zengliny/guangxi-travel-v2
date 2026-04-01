/**
 * 广西旅游网站配置文件
 * 所有硬编码的配置值都应在此文件中管理
 */

(function(global) {
  'use strict';

  // 判断当前环境
  var isProduction = typeof window !== 'undefined' && 
                     window.location && 
                     window.location.hostname.includes('github.io');

  var CONFIG = {
    // 联系信息
    phone: '17200861361',
    wechat: 'ai_fang365',
    email: '',
    
    // 分页配置
    itemsPerPage: 4,
    
    // API 配置
    apiBaseUrl: '',
    
    // 百度统计 ID
    baiduTongjiId: '',
    
    // Sentry DSN
    sentryDsn: '',
    
    // 环境
    env: isProduction ? 'production' : 'development'
  };

  // 兼容 ES6 import 语法
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
  } else {
    global.CONFIG = CONFIG;
  }

})(typeof window !== 'undefined' ? window : this);
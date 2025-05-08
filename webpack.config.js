const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Добавляем полифилы для веб-версии
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-maps': 'react-native-web-maps',
  };

  // Игнорируем нативные модули
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    path: false,
    fs: false,
  };

  return config;
}; 
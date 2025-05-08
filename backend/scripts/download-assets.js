const https = require('https');
const fs = require('fs');
const path = require('path');

// Определяем базовую директорию
const baseDir = path.join(__dirname, '..');

// Используем let вместо const для assets, чтобы можно было изменять массив
let assets = [
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    path: path.join(baseDir, 'public/css/bootstrap.min.css')
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css',
    path: path.join(baseDir, 'public/css/bootstrap-icons.css')
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    path: path.join(baseDir, 'public/js/bootstrap.bundle.min.js')
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/socket.io-client@4.7.2/dist/socket.io.min.js',
    path: path.join(baseDir, 'public/js/socket.io.min.js')
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/fonts/bootstrap-icons.woff2',
    path: path.join(baseDir, 'public/fonts/bootstrap-icons.woff2')
  }
];

// Добавляем загрузку шрифтов Bootstrap Icons
const bootstrapIconsAssets = [
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
    path: path.join(baseDir, 'public/css/bootstrap-icons.css')
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2',
    path: path.join(baseDir, 'public/css/fonts/bootstrap-icons.woff2')
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff',
    path: path.join(baseDir, 'public/css/fonts/bootstrap-icons.woff')
  }
];

// Добавляем эти ассеты к общему списку
assets = [...assets, ...bootstrapIconsAssets];

// Создаем директории, если они не существуют
const dirs = [
  path.join(baseDir, 'public/css'),
  path.join(baseDir, 'public/js'),
  path.join(baseDir, 'public/fonts')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Скачиваем файлы
assets.forEach(asset => {
  https.get(asset.url, (response) => {
    const file = fs.createWriteStream(asset.path);
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded: ${asset.path}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${asset.url}:`, err.message);
  });
}); 
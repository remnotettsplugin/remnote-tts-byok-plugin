// NEW FILE AND CODE FOR: src/settings.tsx

import { declareIndexPlugin, Plugin } from '@remnote/plugin-sdk';

// 定义插件设置中支持的语言选项
const SUPPORTED_LANGUAGES = [
  { key: 'fr-FR', label: 'French (France)' },
  { key: 'en-US', label: 'English (US)' },
  { key: 'es-ES', label: 'Spanish (Spain)' },
  { key: 'de-DE', label: 'German (Germany)' },
  { key: 'it-IT', label: 'Italian (Italy)' },
  { key: 'ja-JP', label: 'Japanese (Japan)' },
  { key: 'ko-KR', label: 'Korean (South Korea)' },
];

async function onActivate(plugin: Plugin) {
  // --- 这里是所有设置项的注册逻辑 ---

  // a. 后端服务 URL
  await plugin.settings.registerStringSetting({
    id: 'backend-url',
    title: 'Backend Service URL',
    description: 'The URL of the plugin\'s backend service (deployed on Vercel).',
    defaultValue: 'https://your-backend-name.vercel.app', 
  });

  // b. 常用语言选择
  await plugin.settings.registerMultiSelectSetting({
    id: 'favorite-languages',
    title: 'Favorite Languages for TTS Menu',
    options: SUPPORTED_LANGUAGES,
    defaultValue: ['fr-FR', 'en-US'],
  });

  // c. Cloudinary API 密钥
  await plugin.settings.registerStringSetting({ id: 'cloudinary_cloud_name', title: 'Cloudinary: Cloud Name' });
  await plugin.settings.registerStringSetting({ id: 'cloudinary_api_key', title: 'Cloudinary: API Key' });
  await plugin.settings.registerStringSetting({ id: 'cloudinary_api_secret', title: 'Cloudinary: API Secret', sensitive: true });

  // d. Google Cloud API 密钥
  await plugin.settings.registerStringSetting({ id: 'google_client_email', title: 'Google Cloud: Client Email' });
  await plugin.settings.registerStringSetting({
      id: 'google_private_key',
      title: 'Google Cloud: Private Key',
      description: 'Copy the full private key from your JSON file, including the BEGIN and END lines.',
      sensitive: true,
      multiline: true,
  });
}

async function onDeactivate(_: Plugin) {}

// 使用 declareIndexPlugin 来声明这个文件是插件的一个入口
declareIndexPlugin(onActivate, onDeactivate);
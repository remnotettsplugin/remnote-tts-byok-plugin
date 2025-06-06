// src/index.tsx

import { App, Plugin, Rem, RichTextInterface } from '@remnote/plugin-sdk';

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

  // --- 1. 注册插件的所有设置项 ---

  // a. 后端服务 URL
  await plugin.settings.registerStringSetting({
    id: 'backend-url',
    title: 'Backend Service URL',
    description: 'The URL of the plugin\'s backend service (deployed on Vercel).',
    // 提示：你可以将你自己的 Vercel URL 作为默认值，方便其他用户
    defaultValue: 'remnote-byok-backend.vercel.app', 
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
  // sensitive: true 会在 UI 中将输入内容显示为 ●●●●●，保护隐私
  await plugin.settings.registerStringSetting({ id: 'cloudinary_api_secret', title: 'Cloudinary: API Secret', sensitive: true });

  // d. Google Cloud API 密钥
  await plugin.settings.registerStringSetting({ id: 'google_client_email', title: 'Google Cloud: Client Email' });
  // multiline: true 提供一个更大的文本框，方便粘贴长长的私钥
  await plugin.settings.registerStringSetting({
      id: 'google_private_key',
      title: 'Google Cloud: Private Key',
      description: 'Copy the full private key from your JSON file, including the BEGIN and END lines.',
      sensitive: true,
      multiline: true,
  });

  // --- 2. 注册命令和弹出菜单 ---

  await plugin.app.registerCommand({
    id: 'generateTTSForSelection',
    name: 'Generate TTS Audio',
    action: async () => {
      const selectedText = await plugin.editor.getSelection();
      if (!selectedText) {
        await plugin.app.toast("No text selected.");
        return;
      }
      
      const textContent = RichTextInterface.toString(selectedText);
      const favLangs = await plugin.settings.getSetting('favorite-languages') as string[];

      // 创建一个包含所有收藏语言的弹出菜单
      await plugin.app.createChoicePopup({
          title: `Generate TTS for "${textContent.substring(0, 25)}..."`,
          options: favLangs.map(key => ({
              label: SUPPORTED_LANGUAGES.find(l => l.key === key)?.label || key,
              action: () => handleTTSGeneration(plugin, textContent, key),
          })),
      });
    },
  });
  
  // 将上面的命令绑定到选中文本时出现的工具栏上
  await plugin.ui.registerSelectionPopup({
      id: 'tts-popup-button',
      name: 'Generate TTS',
      commandId: 'generateTTSForSelection',
  });
}

/**
 * 核心处理函数：收集所有信息并发送到后端
 */
async function handleTTSGeneration(plugin: Plugin, text: string, languageCode: string) {
  // 1. 从插件设置中获取用户填写的 URL 和所有密钥
  const backendUrl = await plugin.settings.getSetting('backend-url') as string;
  const cloudinaryConfig = {
      cloud_name: await plugin.settings.getSetting('cloudinary_cloud_name'),
      api_key: await plugin.settings.getSetting('cloudinary_api_key'),
      api_secret: await plugin.settings.getSetting('cloudinary_api_secret'),
  };
  const googleCredentials = {
      client_email: await plugin.settings.getSetting('google_client_email'),
      private_key: await plugin.settings.getSetting('google_private_key'),
  };

  // 2. 验证用户是否已完成配置
  if (!backendUrl || !cloudinaryConfig.cloud_name || !googleCredentials.client_email || !googleCredentials.private_key) {
      await plugin.app.toast("配置不完整。请前往插件设置填写所有 API 密钥和后端 URL。");
      return;
  }

  await plugin.app.toast(`正在生成 ${languageCode} 语音...`);

  try {
    // 3. 将所有信息打包，通过 POST 请求发送到我们的后端引擎
    const response = await fetch(`${backendUrl}/api/generate-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        languageCode,
        googleCredentials,
        cloudinaryConfig
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // 如果后端返回错误，显示错误信息
      throw new Error(responseData.error || 'Backend request failed with no specific message.');
    }

    const audioUrl = responseData.url;

    // 4. 将后端返回的音频 URL 插入到 Remnote 编辑器中
    await plugin.editor.insertAudio(audioUrl);
    await plugin.app.toast("语音已成功插入！");

  } catch (error) {
    console.error(error);
    await plugin.app.toast(`发生错误: ${error.message}`);
  }
}

async function onDeactivate(_: Plugin) {}

export { onActivate, onDeactivate };
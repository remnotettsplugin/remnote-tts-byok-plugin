// CORRECTED CODE FOR: src/index.tsx (Main Logic ONLY)

import { declareIndexPlugin, Plugin, RichTextInterface } from '@remnote/plugin-sdk';

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
      const favLangs = await plugin.settings.getSetting('favorite-languages') as string[] || [];

      if (favLangs.length === 0) {
        await plugin.app.toast("Please select favorite languages in the plugin settings first.");
        return;
      }

      await plugin.app.createChoicePopup({
          title: `Generate TTS for "${textContent.substring(0, 25)}..."`,
          options: favLangs.map(key => ({
              label: SUPPORTED_LANGUAGES.find(l => l.key === key)?.label || key,
              action: () => handleTTSGeneration(plugin, textContent, key),
          })),
      });
    },
  });
  
  await plugin.ui.registerSelectionPopup({
      id: 'tts-popup-button',
      name: 'Generate TTS',
      commandId: 'generateTTSForSelection',
  });
}

async function handleTTSGeneration(plugin: Plugin, text: string, languageCode: string) {
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

  if (!backendUrl || !cloudinaryConfig.cloud_name || !googleCredentials.client_email || !googleCredentials.private_key) {
      await plugin.app.toast("Configuration incomplete. Please fill in all API keys and the Backend URL in plugin settings.");
      return;
  }

  await plugin.app.toast(`Generating ${languageCode} audio...`);

  try {
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
      throw new Error(responseData.error || 'Backend request failed.');
    }

    const audioUrl = responseData.url;
    await plugin.editor.insertAudio(audioUrl);
    await plugin.app.toast("Audio inserted successfully!");

  } catch (error) {
    console.error(error);
    await plugin.app.toast(`Error: ${error.message}`);
  }
}

async function onDeactivate(_: Plugin) {}

declareIndexPlugin(onActivate, onDeactivate);
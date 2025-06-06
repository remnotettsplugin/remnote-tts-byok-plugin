// CORRECTED CODE FOR: src/settings.tsx (Settings Logic ONLY)

import { declareIndexPlugin, Plugin } from '@remnote/plugin-sdk';

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
  await plugin.settings.registerStringSetting({
    id: 'backend-url',
    title: 'Backend Service URL',
    description: 'The URL of the plugin\'s backend service (deployed on Vercel).',
    defaultValue: 'https://your-backend-name.vercel.app', 
  });

  await plugin.settings.registerMultiSelectSetting({
    id: 'favorite-languages',
    title: 'Favorite Languages for TTS Menu',
    options: SUPPORTED_LANGUAGES,
    defaultValue: ['fr-FR', 'en-US'],
  });

  await plugin.settings.registerStringSetting({ id: 'cloudinary_cloud_name', title: 'Cloudinary: Cloud Name' });
  await plugin.settings.registerStringSetting({ id: 'cloudinary_api_key', title: 'Cloudinary: API Key' });
  await plugin.settings.registerStringSetting({ id: 'cloudinary_api_secret', title: 'Cloudinary: API Secret', sensitive: true });

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

declareIndexPlugin(onActivate, onDeactivate);
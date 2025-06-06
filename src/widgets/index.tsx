// CORRECT AND CLEANED CODE FOR: src/widgets/index.tsx

import { declareIndexPlugin, React, WidgetLocation } from '@remnote/plugin-sdk';

export const SampleWidget = () => {
  return (
    <div className="p-2 m-2 rounded-lg" style={{ backgroundColor: 'yellow' }}>
      This is a sample widget!
    </div>
  );
};

async function onActivate() {}
async function onDeactivate() {}

declareIndexPlugin(onActivate, onDeactivate);
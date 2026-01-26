import React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './Editor';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Editor />
  </React.StrictMode>
);

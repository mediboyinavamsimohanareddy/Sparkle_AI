import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { ChatProvider } from './context/ChatContext';
import { VoiceProvider } from './context/VoiceContext';
import MainLayout from './pages/MainLayout';

export default function App() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <ChatProvider>
          <VoiceProvider>
            <MainLayout />
          </VoiceProvider>
        </ChatProvider>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}

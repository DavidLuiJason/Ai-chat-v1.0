/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { HomeView } from './components/home/HomeView.tsx';
import { WorkspacesView } from './components/workspaces/WorkspacesView.tsx';
import { AiToolsView } from './components/ai-tools/AiToolsView.tsx';
import { WorkersView } from './components/workers/WorkersView.tsx';
import { ManagersView } from './components/managers/ManagersView.tsx';
import { DirectChatsView } from './components/direct-chats/DirectChatsView.tsx';
import { FilesView } from './components/files/FilesView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { AddAccountModal } from './components/ai-tools/AddAccountModal.tsx';
import { StagedAvailabilityModal } from './components/workspaces/StagedAvailabilityModal.tsx';
import { ManagerHandoffModal } from './components/workspaces/ManagerHandoffModal.tsx';

function MainLayout() {
  const {
    activeNav,
    activeAvailabilityModal,
    setActiveAvailabilityModal,
    activeHandoffModal,
    setActiveHandoffModal,
  } = useApp();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-slate-200">
      {/* Top Navbar */}
      <Navbar onOpenAddAccount={() => setIsAddAccountOpen(true)} />

      {/* Main Workspace Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onOpenAddAccount={() => setIsAddAccountOpen(true)} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeNav === 'home' && (
            <HomeView onOpenAddAccount={() => setIsAddAccountOpen(true)} />
          )}
          {activeNav === 'workspaces' && <WorkspacesView />}
          {activeNav === 'ai-tools' && (
            <AiToolsView onOpenAddAccount={() => setIsAddAccountOpen(true)} />
          )}
          {activeNav === 'workers' && <WorkersView />}
          {activeNav === 'managers' && <ManagersView />}
          {activeNav === 'direct-chats' && <DirectChatsView />}
          {activeNav === 'files' && <FilesView />}
          {activeNav === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />

      <StagedAvailabilityModal
        check={activeAvailabilityModal}
        onClose={() => setActiveAvailabilityModal(null)}
      />

      <ManagerHandoffModal
        handoff={activeHandoffModal}
        onClose={() => setActiveHandoffModal(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

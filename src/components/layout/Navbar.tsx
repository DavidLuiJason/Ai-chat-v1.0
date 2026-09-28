import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Menu, Plus, Settings } from 'lucide-react';

interface NavbarProps {
  onOpenAddAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddAccount }) => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    accounts,
    setActiveNav,
    toggleDrawer,
  } = useApp();

  const connectedAccountsCount = accounts.filter((a) => a.connectionStatus === 'CONNECTED').length;

  return (
    <header className="h-13 border-b border-slate-200 bg-white px-3 sm:px-5 flex items-center justify-between z-20 shrink-0">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          onClick={toggleDrawer}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors md:hidden cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div
          onClick={() => setActiveNav('home')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            AI
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">AI Chat</span>
        </div>

        {/* Workspace Switcher (if workspaces exist) */}
        {workspaces.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-500">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Workspace</span>
            <select
              value={activeWorkspaceId || ''}
              onChange={(e) => setActiveWorkspaceId(e.target.value)}
              className="font-medium text-slate-900 bg-transparent border-none focus:outline-hidden cursor-pointer hover:text-slate-600 transition-colors text-xs"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connected Count */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`w-2 h-2 rounded-full ${connectedAccountsCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className="text-slate-600 font-medium">{connectedAccountsCount} Connected</span>
        </div>

        {/* Quick Connect Account Button */}
        <button
          onClick={onOpenAddAccount}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          title="Connect AI Account"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden xs:inline">Connect Account</span>
          <span className="xs:hidden">Connect</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setActiveNav('settings')}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

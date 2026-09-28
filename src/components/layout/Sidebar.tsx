import React from 'react';
import { useApp, NavView } from '../../context/AppContext.tsx';
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Users2,
  ShieldCheck,
  MessageSquare,
  FileCode2,
  Settings,
  X,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddAccount: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddAccount }) => {
  const {
    activeNav,
    setActiveNav,
    workspaces,
    accounts,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useApp();

  const navItems: { id: NavView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: <FolderGit2 className="w-4 h-4" />,
      badge: workspaces.length > 0 ? workspaces.length : undefined,
    },
    {
      id: 'ai-tools',
      label: 'AI Tools & Accounts',
      icon: <Cpu className="w-4 h-4" />,
      badge: accounts.length > 0 ? accounts.length : undefined,
    },
    {
      id: 'workers',
      label: 'Workers',
      icon: <Users2 className="w-4 h-4" />,
    },
    {
      id: 'managers',
      label: 'Managers & Squads',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'direct-chats',
      label: 'Direct Chats',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'files',
      label: 'Files & Artifacts',
      icon: <FileCode2 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (id: NavView) => {
    setActiveNav(id);
    setIsDrawerOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 select-none">
      {/* Drawer Header on Mobile */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            AI
          </div>
          <span className="font-bold text-sm text-slate-900">AI Chat</span>
        </div>
        <button
          onClick={() => setIsDrawerOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Close navigation drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Workforce Navigation
        </div>

        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Callout */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <button
          onClick={() => {
            onOpenAddAccount();
            setIsDrawerOpen(false);
          }}
          className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Connect AI Account</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex h-full shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer (closed by default) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-50 flex h-full">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

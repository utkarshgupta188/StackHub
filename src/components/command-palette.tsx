'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, ArrowRight, X } from 'lucide-react';
import { usePlugins } from '@/context/plugin-context';

export default function CommandPalette() {
  const { allCommands, runCommandAction, setActivePage, addFeedNotification } = usePlugins();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Command Palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Core system commands
  const systemCommands = [
    {
      id: 'sys-dashboard',
      name: 'System: Go to Dashboard',
      description: 'Navigate to your primary connected workspace widgets grid.',
      category: 'System',
      action: () => {
        setActivePage('/dashboard');
        return 'Navigated to Dashboard';
      }
    },
    {
      id: 'sys-plugins',
      name: 'System: Manage Extensions',
      description: 'Enable, disable or configure installed plugins and tools.',
      category: 'System',
      action: () => {
        setActivePage('/plugins');
        return 'Navigated to Plugin Manager';
      }
    },
    {
      id: 'sys-notifications',
      name: 'System: Clear activity feed log',
      description: 'Reset all logs in the developer center dashboard feed.',
      category: 'System',
      action: (ctx: any) => {
        ctx.clearFeed();
        return 'Cleared activity feed';
      }
    }
  ];

  const mergedCommands: any[] = [...systemCommands, ...allCommands];

  const filteredCommands = mergedCommands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation inside menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleExecute(filteredCommands[selectedIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  const handleExecute = async (cmd: any) => {
    try {
      // Build context for execution hooks
      const ctx = {
        setActivePage,
        addFeedNotification,
        clearFeed: () => {
          localStorage.removeItem('stackhub_feed');
          window.location.reload();
        }
      };

      let resultMsg = '';
      if (cmd.id.startsWith('sys-')) {
        resultMsg = cmd.action(ctx) || '';
      } else {
        resultMsg = await runCommandAction(cmd.id, ctx) || '';
      }

      if (resultMsg) {
        setToastMessage(resultMsg);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return toastMessage ? (
      <div className="fixed bottom-4 right-4 z-50 glass-panel border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in shadow-2xl shadow-emerald-950/20">
        <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
        <span className="text-xs font-mono">{toastMessage}</span>
      </div>
    ) : null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Raycast Container */}
      <div 
        ref={modalRef}
        className="w-full max-w-2xl glass-panel rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 animate-fade-in flex flex-col max-h-[500px]"
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 border-b border-zinc-800/50 py-3.5">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0 text-sm font-sans"
            placeholder="Type a command or search plugins..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 p-0.5 hover:bg-zinc-800/30 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Command Results Grid */}
        <div className="overflow-y-auto flex-1 p-2">
          {filteredCommands.length > 0 ? (
            (Object.entries(
              filteredCommands.reduce((acc, cmd) => {
                if (!acc[cmd.category]) acc[cmd.category] = [];
                acc[cmd.category].push(cmd);
                return acc;
              }, {} as Record<string, typeof filteredCommands>)
            ) as [string, any[]][]).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <h3 className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                  {category}
                </h3>
                <div className="space-y-0.5">
                  {cmds.map((cmd) => {
                    const globalIndex = filteredCommands.findIndex(fc => fc.id === cmd.id);
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => handleExecute(cmd)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-100 ${
                          isSelected
                            ? 'bg-zinc-800/60 text-zinc-100'
                            : 'text-zinc-400 hover:bg-zinc-800/20 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Terminal className={`w-4 h-4 ${isSelected ? 'text-zinc-100' : 'text-zinc-500'}`} />
                          <div>
                            <p className="text-xs font-medium font-sans">{cmd.name}</p>
                            <p className="text-[11px] text-zinc-500 truncate max-w-[420px] font-sans mt-0.5">
                              {cmd.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {cmd.shortcut && (
                            <span className="text-[9px] font-semibold font-mono bg-zinc-800/80 border border-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-400 uppercase">
                              {cmd.shortcut}
                            </span>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <Terminal className="w-8 h-8 text-zinc-600 mx-auto mb-3 animate-pulse" />
              <p className="text-xs font-semibold text-zinc-400 font-sans">No commands found matching "{search}"</p>
              <p className="text-[11px] text-zinc-500 mt-1 font-sans">Try searching for generic terms like "github", "aws" or "docker"</p>
            </div>
          )}
        </div>

        {/* Command Palette Footnotes */}
        <div className="px-4 py-2 border-t border-zinc-900 bg-[#060608]/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <div>
            <span>Powered by StackHub Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
}

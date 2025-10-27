import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SystemIcon } from './icons/SystemIcon';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { name: 'Light', value: 'light', icon: <SunIcon className="w-5 h-5" /> },
    { name: 'Dark', value: 'dark', icon: <MoonIcon className="w-5 h-5" /> },
    { name: 'System', value: 'system', icon: <SystemIcon className="w-5 h-5" /> },
  ] as const;

  const currentThemeIcon = themes.find(t => t.value === theme)?.icon || <SystemIcon className="w-5 h-5" />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm"
      >
        {currentThemeIcon}
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20">
          <ul className="p-1">
            {themes.map(t => (
              <li key={t.value}>
                <button
                  onClick={() => {
                    setTheme(t.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-xl text-left transition ${
                    theme === t.value
                      ? 'bg-pastel-mint/20 text-pastel-mint font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.icon}
                  <span>{t.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
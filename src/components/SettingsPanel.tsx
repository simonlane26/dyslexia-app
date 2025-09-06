'use client';

import { useState, useEffect } from 'react';
import { ModernButton } from './ModernButton';
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface SettingsPanelProps {
  isPro: boolean;
  bgColor: string;
  setBgColor: (color: string) => void;
  font: string;
  setFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  voiceId: string;
  setVoiceId: (id: string) => void;
  resetSettings: () => void;
  theme: {
    bg: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
  getFontFamily?: () => string;
}

const FREE_COLOR = '#f9f7ed';

const COLOR_SWATCHES = [
  { name: 'Cream', value: '#f9f7ed' },
  { name: 'Light Gray', value: '#f0f0f0' },
  { name: 'Soft Yellow', value: '#fff9db' },
  { name: 'Pale Blue', value: '#eef4ff' },
  { name: 'Pink', value: '#fff0f5' },
  { name: 'White', value: '#ffffff' },
] as const;

export function SettingsPanel({
  isPro,
  bgColor,
  setBgColor,
  font,
  setFont,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  darkMode,
  setDarkMode,
  voiceId,
  setVoiceId,
  resetSettings,
  theme,
  getFontFamily,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ If user is Free and a non-free color is loaded from localStorage, force it to FREE_COLOR
  useEffect(() => {
    if (!isPro && bgColor !== FREE_COLOR) {
      setBgColor(FREE_COLOR);
    }
  }, [isPro, bgColor, setBgColor]);

  // ✅ Only render the free swatch for Free users
  const COLORS_TO_RENDER = isPro
    ? COLOR_SWATCHES
    : COLOR_SWATCHES.filter(c => c.value === FREE_COLOR);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 font-semibold text-left text-gray-800 transition bg-gray-50 hover:bg-gray-100 rounded-xl"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31 2.37 2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          ⚙️ Settings
        </span>
        {isOpen ? '🔻' : '▶'}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 12,
            backgroundColor: theme.surface,
            border: `2px solid ${theme.border}`,
            backdropFilter: !highContrast ? 'blur(3px)' : 'none',
            color: theme.text,
            fontFamily: getFontFamily ? getFontFamily() : undefined,
            fontSize: `${fontSize}px`,
          }}
        >
          {/* Background Color */}
          <label className="block mb-2 font-semibold" style={{ color: theme.text }}>
            🎨 Background Color
          </label>
          <div className={`grid gap-2 ${isPro ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-1 sm:grid-cols-1'}`}>
            {COLORS_TO_RENDER.map((color) => (
              <button
                key={color.value}
                onClick={() => setBgColor(color.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  bgColor === color.value
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                aria-label={`Set background to ${color.name}`}
              >
                {bgColor === color.value && (
                  <span className="text-xs font-bold text-gray-700">✓</span>
                )}
              </button>
            ))}
          </div>
          {!isPro && (
            <p className="mt-2 text-xs text-slate-500">
              More background colors available with Pro ✨
            </p>
          )}

          {/* Font */}
          <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
            <label className="block mb-2 font-semibold" style={{ color: theme.text }}>
              🅵 Font
            </label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="flex-1 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
              }}
            >
              <option value="Lexend">Lexend</option>
              <option value="Open Dyslexic">Open Dyslexic</option>
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
            <label className="block mb-2 font-semibold" style={{ color: theme.text }}>
              🗚 Font Size
            </label>
            <input
              type="range"
              min="14"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="block mb-2 font-semibold" style={{ color: theme.text }}>
              {fontSize}px
            </span>
          </div>

          {/* High Contrast */}
          <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
            <label className="block mb-2 font-semibold" style={{ color: theme.text }}>
              ⚡ High Contrast
            </label>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="toggle"
            />
          </div>

          {/* Dark Mode */}
          <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
            <label className="block mb-2 font-semibold" style={{ color: theme.text }}>
              🌙 Dark Mode
            </label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="toggle"
            />
          </div>

          {/* Voice */}
          <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
            <label className="block mb-2 font-semibold" style={{ color: theme.text }}>
              🗣️ Voice
            </label>

            <SignedIn>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="flex-1 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
                }}
              >
                {/* Ensure IDs match your ElevenLabs voices */}
                <option value="21m00Tcm4TlvDq8ikWAM">Rachel</option>
                <option value="jkSXBeN4g5pNelNQ3YWw">Molly</option>
                <option value="EXAVITQu4vr4xnSDxMaL">Elli</option>
                <option value="wUwsnXivqGrDWuz1Fc89">Liam</option>
              </select>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 py-2 text-white rounded-lg bg-slate-900">
                  Sign in to choose voices
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Reset */}
          <div className="mt-4">
            <ModernButton onClick={resetSettings} variant="danger" size="sm">
              🗑️ Reset All
            </ModernButton>
          </div>
        </div>
      )}
    </div>
  );
}

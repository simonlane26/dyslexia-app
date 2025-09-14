'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Lock } from "lucide-react";
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


const FREE_COLOR_HEXES = new Set<string>([
  "#f9f7ed", // Cream
  "#f0f0f0", // Light Gray
  "#fff9db", // Soft Yellow
  "#eef4ff", // Pale Blue
  "#fff0f5", // Pink
  "#ffffff", // White
]);

const COLOR_SWATCHES = [
  { name: 'Cream', value: '#f9f7ed' },
  { name: 'Light Gray', value: '#f0f0f0' },
  { name: 'Soft Yellow', value: '#fff9db' },
  { name: 'Pale Blue', value: '#eef4ff' },
  { name: 'Pink', value: '#fff0f5' },
  { name: 'White', value: '#ffffff' },
  { name: 'Mint', value: '#ECFDF5' },
  { name: 'Aqua', value: '#ECFEFF' },
  { name: 'Sage', value: '#F1F8F5' },
  { name: 'Lavender', value: '#F5F3FF' },
  { name: 'Lilac', value: '#EEF2FF' },
  { name: 'Peach', value: '#FFF4E6' },
  { name: 'Buff', value: '#F3E7C9' },
  { name: 'Sepia Light', value: '#F5E6C8' },
  { name: 'Off-White Warm', value: '#FAFAF7' },
  { name: 'Pale Teal', value: '#E6FAF5' },
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
  const router = useRouter();
  

  // ✅ If user is Free and a non-free color is loaded from localStorage, force it to FREE_COLOR
  useEffect(() => {
  if (!isPro && !FREE_COLOR_HEXES.has(bgColor)) {
    setBgColor("#f9f7ed");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isPro]);

  // ✅ Only render the free swatch for Free users
  const COLORS_TO_RENDER = isPro
    ? COLOR_SWATCHES
    : COLOR_SWATCHES.filter(c => FREE_COLOR_HEXES.has(c.value));

  return (
    <div className="mb-6">
      <button
  type="button"
  onClick={() => setIsOpen(!isOpen)}
  aria-expanded={isOpen}
  className="flex items-center justify-between w-full px-4 py-3 font-semibold text-left text-gray-800 transition bg-gray-50 hover:bg-gray-100 rounded-xl"
>
  <span className="flex items-center gap-2">
    <Settings className="w-5 h-5 text-gray-600" />
    <span>Settings</span>
  </span>
  <span aria-hidden>{isOpen ? "▾" : "▸"}</span>
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

<div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
  {COLORS_TO_RENDER.map((color) => {
    const proOnly = !FREE_COLOR_HEXES.has(color.value);
    const active = bgColor === color.value;

    return (
      <button
        key={color.value}
        type="button"
        onClick={() => {
          if (proOnly && !isPro) {
            router.push("/pricing"); // upsell instead of applying
            return;
          }
          setBgColor(color.value);
        }}
        aria-label={`Set background to ${color.name}${proOnly && !isPro ? " (Pro only)" : ""}`}
        aria-disabled={proOnly && !isPro}
        title={proOnly && !isPro ? "Pro only — Upgrade to use this color" : color.name}
        className={[
          "relative h-8 w-8 rounded-md border transition",
          active ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105",
          proOnly && !isPro ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        style={{
          backgroundColor: color.value,
          borderColor: active ? "#3b82f6" : "#e5e7eb",
        }}
      >
        {active && (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">
            ✓
          </span>
        )}

        {proOnly && !isPro && (
          <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-white/90 border border-slate-200 p-[2px] shadow">
            <Lock className="w-3 h-3 text-slate-500" />
          </span>
        )}
      </button>
    );
  })}
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
                <option value="ZT9u07TYPVl83ejeLakq">Rachelle</option>
                <option value="jkSXBeN4g5pNelNQ3YWw">Molly</option>
                <option value="EXAVITQu4vr4xnSDxMaL">Elli</option>
                <option value="wUwsnXivqGrDWuz1Fc89">Liam</option>
                <option value="NFG5qt843uXKj4pFvR7C">Adam</option>
                <option value="BL7YSL1bAkmW8U0JnU8o">Jen</option>
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

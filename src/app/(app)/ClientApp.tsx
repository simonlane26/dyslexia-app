// src/app/(app)/ClientApp.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs/server';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ModernButton } from '@/components/ModernButton';

export function ClientApp() {
  const [bgColor, setBgColor] = useState('#f9f7ed');
  const [font, setFont] = useState('Lexend');
  const [fontSize, setFontSize] = useState(18);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM');
  const [text, setText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [isPro, setIsPro] = useState(false);

  const { user, isLoaded } = useUser(); // ✅ Get user in client component

  useEffect(() => {
    if (!isLoaded) return;

    const fetchUserData = async () => {
  try {
    console.log('🔍 Full user metadata:', {
      publicMetadata: user?.publicMetadata,
      // privateMetadata is not accessible client-side
      unsafeMetadata: user?.unsafeMetadata
    });
    
    const isPro = user?.publicMetadata?.isPro === true || user?.unsafeMetadata?.isPro === true;
    console.log('🔍 isPro from publicMetadata:', isPro);
    setIsPro(isPro);
    // ... rest of code
  } catch (err) {
    console.error('Failed to fetch user data:', err);
  }
};
    fetchUserData();
  }, [user, isLoaded]);

// ... rest of your functions ...

// Inside ClientApp.tsx
const theme = darkMode
? {
      bg: '#0f1629', 
      text: '#ffffff', // ← Change to pure white for dark mode
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      surface: 'rgba(30, 41, 59, 0.8)', 
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
  }
: {
    bg: '#f8fafc', // ✅ Main background = selected color
   text: highContrast ? '#000000' : '#1e293b',
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#f472b6',
    surface: 'rgba(255, 255, 255, 0.8)', // ✅ Light glassmorphism
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#facc15',
    danger: '#ef4444',
  };

useEffect(() => {
  if (!isLoaded || !user) return;

  const loadUserData = async () => {
    try {
      // clerkClient cannot be used client-side
      // Consider moving this logic to an API endpoint
      const response = await fetch('/api/user-data');
      const userData = await response.json();
      const isProUser = userData.isPro === true;
      
      console.log('👤 User data:', userData);
      console.log('✨ isPro:', isProUser); // ← Check this in DevTools

      setIsPro(isProUser);

      if (!isProUser) {
        const savedCount = userData.simplificationCount as number || 0;
        setCount(savedCount);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  loadUserData();
}, [user, isLoaded]);

useEffect(() => {
  console.log('🔄 ClientApp re-rendered with bgColor:', bgColor);
}, [bgColor]);
  const getFontFamily = () => {
    switch (font) {
      case 'Open Dyslexic': return `'Open Dyslexic', monospace`;
      case 'Lexend': return `'Lexend', sans-serif`;
      case 'Arial': return `'Arial', sans-serif`;
      case 'Verdana': return `'Verdana', sans-serif`;
      default: return `'Lexend', sans-serif`;
    }
  };

  const resetSettings = () => {
    setBgColor('#f9f7ed');
    setFont('Lexend');
    setFontSize(18);
    setHighContrast(false);
    setDarkMode(false);
    setVoiceId('21m00Tcm4TlvDq8ikWAM');
  };

  const [error, setError] = useState<string | null>(null);

  const simplifyText = async () => {
  if (!text.trim()) {
    alert("No text to simplify. Please write something first.");
    return;
  }

  console.log('✨ Starting simplification...');
  setError(null);
  setLoading(true);

  try {
    const res = await fetch('/api/simplify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    console.log('📨 Response status:', res.status);
    console.log('📨 Response headers:', Object.fromEntries(res.headers.entries()));

    const contentType = res.headers.get('content-type');
    console.log('📨 Content type:', contentType);

   if (!res.ok) {
  console.log('❌ API Error Status:', res.status);
  console.log('❌ Content Type:', res.headers.get('content-type'));
  
  try {
    const errorData = await res.json();
    console.log('❌ Error Data:', errorData); // Changed from console.error
    
    if (res.status === 429) {
      setError('Daily limit reached. Upgrade to Pro for unlimited simplifications.');
    } else if (res.status === 401) {
      setError('Please sign in to use text simplification.');
    } else {
      setError(errorData.error || errorData.message || 'Simplification failed');
    }
  } catch (parseError) {
    console.log('❌ Could not parse error response');
    setError(`Server error (${res.status}). Please try again.`);
  }
  
  setLoading(false);
  return;
}
    const data = await res.json();
    console.log('✅ Simplification response:', data);

    if (data.simplifiedText) {
      setSimplifiedText(data.simplifiedText);
    } else {
      setError('No simplified text received');
    }

  } catch (error: unknown) {
    console.error('❌ Network error:', error);
    setError(`Network error: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    setLoading(false);
  }
};

  const handleDictation = () => {
    setIsListening(!isListening);
    setTimeout(() => setIsListening(false), 2000);
  };

  const handleReadAloud = async () => {
  if (!text.trim()) {
    alert("No text to read.");
    return;
  }

  setIsReading(true);

  try {
    console.log('🎵 Starting text-to-speech request...');
    
    const res = await fetch('/api/simplify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: text.trim(),
        voiceId: voiceId // Make sure to send voiceId if your API uses it
      }),
    });

    console.log('📡 Response status:', res.status);
    console.log('📦 Response headers:', res.headers.get('content-type'));

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error Response:', errorText);
      alert(`Failed to generate speech: ${res.status} - ${errorText}`);
      setIsReading(false);
      return;
    }

    // Check content type
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('audio')) {
      console.error('❌ Unexpected content type:', contentType);
      const responseText = await res.text();
      console.error('Response body:', responseText);
      alert('Server returned unexpected content type: ' + contentType);
      setIsReading(false);
      return;
    }

    console.log('🎵 Converting to audio blob...');
    const audioBlob = await res.blob();
    console.log('📊 Blob size:', audioBlob.size, 'bytes');
    console.log('📊 Blob type:', audioBlob.type);

    if (audioBlob.size === 0) {
      console.error('❌ Empty audio blob received');
      alert('Received empty audio data from server');
      setIsReading(false);
      return;
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('🔗 Audio URL created:', audioUrl);

    const audio = new Audio(audioUrl);
    
    // Add more event listeners for debugging
    audio.onloadstart = () => console.log('🎵 Audio loading started');
    audio.oncanplay = () => console.log('🎵 Audio can play');
    audio.onplay = () => console.log('🎵 Audio playback started');
    audio.onpause = () => console.log('⏸️ Audio paused');
    
    audio.onended = () => {
      console.log('✅ Audio playback ended');
      URL.revokeObjectURL(audioUrl);
      setIsReading(false);
    };

    audio.onerror = (e) => {
      console.error('❌ Audio error:', e);
      console.error('Audio error details:', audio.error);
      URL.revokeObjectURL(audioUrl);
      setIsReading(false);
      alert('Audio playback failed. The audio format may not be supported.');
    };

    // Try to play
    console.log('▶️ Attempting to play audio...');
    try {
      await audio.play();
      console.log('✅ Audio play() succeeded');
    } catch (playError: unknown) {
      console.error('❌ Audio play() failed:', playError);
      URL.revokeObjectURL(audioUrl);
      setIsReading(false);
      
      if (playError instanceof Error && playError.name === 'NotAllowedError') {
        alert('Audio playback blocked. Please interact with the page first (click anywhere) then try again.');
      } else {
        alert('Audio playback failed: ' + (playError instanceof Error ? playError.message : String(playError)));
      }
    }

  } catch (error: unknown) {
    console.error('❌ Unexpected error:', error);
    setIsReading(false);
    alert('Network error: ' + (error instanceof Error ? error.message : String(error)));
  }
};
const handleReadAloudSimplified = async () => {
  if (!simplifiedText.trim()) {
    alert("No simplified text to read.");
    return;
  }

  setIsReading(true);

  try {
    const res = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: simplifiedText }),
    });

    if (!res.ok) throw new Error('Failed to generate speech');

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setIsReading(false);
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      setIsReading(false);
      alert('Playback failed');
    };

    audio.play();
  } catch (error) {
    console.error('ElevenLabs error:', error);
    setIsReading(false);
    alert('Failed to play audio.');
  }
};
  return (
    <div
  key={bgColor} // ok if you truly want a remount on color change
  style={{
    backgroundColor: theme.bg,           
    color: theme.text,
    fontFamily: getFontFamily(),
    fontSize: `${fontSize}px`,
    minHeight: '100vh',
    padding: '2rem',
    transition: 'background-color 0.3s ease',
    // border: '5px solid red',          // debug only
  }}
>
  <h1 className="flex items-center justify-center gap-3 mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
  {/* Solid emoji — uses theme-aware text colour */}
  <span
    aria-hidden
    style={{ color: darkMode ? '#f9fafb' : '#1e293b', lineHeight: 1 }}
  >
    ✍️
  </span>

  {/* Gradient text — applied ONLY to the words */}
  <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
    Dyslexia-Friendly Writing App
  </span>
</h1>


  <SettingsPanel
    bgColor={bgColor}
    setBgColor={setBgColor}
    font={font}
    setFont={setFont}
    fontSize={fontSize}
    setFontSize={setFontSize}
    highContrast={highContrast}
    setHighContrast={setHighContrast}
    darkMode={darkMode}
    setDarkMode={setDarkMode}
    voiceId={voiceId}
    setVoiceId={setVoiceId}
    resetSettings={resetSettings}
    theme={theme}
    getFontFamily={getFontFamily}
    isPro={isPro}
  />

  <textarea
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Start writing..."
    style={{
      backgroundColor: theme.surface,
      color: theme.text,
      fontFamily: getFontFamily(),
      fontSize: `${fontSize}px`,
      border: `2px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '16px',
      minHeight: '200px',
    }}
  />
  {/* ...rest of your app... */}
</div>
  );
}

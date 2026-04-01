'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type UserType = 'individual' | 'student' | 'employee' | null;
type Feature = 'writing' | 'emails' | 'readAloud' | 'documents' | 'dictation' | 'reading';

interface OnboardingData {
  userType: UserType;
  font: string;
  bgColour: string;
  fontSize: number;
  features: Feature[];
}

const FONTS = [
  { id: 'Lexend', label: 'Lexend', family: "'Lexend', sans-serif" },
  { id: 'OpenDyslexic', label: 'OpenDyslexic', family: "'OpenDyslexic', sans-serif" },
  { id: 'Arial', label: 'Arial', family: 'Arial, sans-serif' },
];

const BG_COLOURS = [
  { id: '#FDF6E3', label: 'Cream' },
  { id: '#FFFFFF', label: 'White' },
  { id: '#E8F5E9', label: 'Green' },
  { id: '#E3F2FD', label: 'Blue' },
  { id: '#FFF3E0', label: 'Peach' },
  { id: '#F3E5F5', label: 'Lilac' },
  { id: '#2C2C2A', label: 'Dark' },
];

const USER_TYPES = [
  { id: 'individual' as UserType, icon: '🏠', title: 'For myself', desc: 'Personal writing, emails, reading letters and documents' },
  { id: 'student' as UserType, icon: '🎓', title: 'For school or college', desc: 'Homework, essays, reading textbooks, exam prep' },
  { id: 'employee' as UserType, icon: '💼', title: 'For work', desc: 'Work emails, reports, reading policies and documents' },
];

const FEATURES: { id: Feature; icon: string; name: string; desc: string }[] = [
  { id: 'writing', icon: '✍️', name: 'Fix my writing', desc: 'Spelling, grammar, clarity' },
  { id: 'emails', icon: '📧', name: 'Help with emails', desc: 'Write and check messages' },
  { id: 'readAloud', icon: '🔊', name: 'Read things aloud', desc: 'Hear text spoken to me' },
  { id: 'documents', icon: '📄', name: 'Understand documents', desc: 'Decode letters and reports' },
  { id: 'dictation', icon: '🎙️', name: 'Speak instead of type', desc: 'Voice dictation' },
  { id: 'reading', icon: '📚', name: 'Read more easily', desc: 'Reading guide and support' },
];

const TOTAL_STEPS = 6;

export default function OnboardingWizard() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    userType: null,
    font: 'Lexend',
    bgColour: '#FDF6E3',
    fontSize: 16,
    features: [],
  });
  const [tryText, setTryText] = useState('');
  const [tryResult, setTryResult] = useState('');
  const [tryLoading, setTryLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const firstName = user?.firstName || 'there';

  const goTo = useCallback((s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const completeOnboarding = useCallback(async (firstAction: string) => {
    setSaving(true);
    try {
      // Persist visual preferences to localStorage so /app picks them up immediately
      localStorage.setItem('font', data.font);
      localStorage.setItem('fontSize', String(data.fontSize));
      localStorage.setItem('bgColor', data.bgColour);

      // Write the onboarding-complete marker in the format the existing
      // useOnboarding hook expects, so first-type / first-save celebrations work
      localStorage.setItem('dyslexia-writer-onboarding', JSON.stringify({
        currentStep: null,
        hasCompletedOnboarding: true,
        struggles: [],
        showFirstTypeCelebration: false,
        showFirstSaveCelebration: false,
      }));

      // Persist to Clerk metadata (best-effort)
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: data.userType,
          priorityFeatures: data.features,
          onboardingCompleted: true,
        }),
      }).catch(() => {});

      switch (firstAction) {
        case 'decode':
          router.push('/app?tab=decoder');
          break;
        case 'extension':
          window.open('https://chrome.google.com/webstore/detail/dyslexiawrite', '_blank');
          router.push('/app');
          break;
        default:
          router.push('/app');
      }
    } catch {
      router.push('/app');
    }
  }, [data, router]);

  const handleTrySimplify = useCallback(async () => {
    const input = tryText.trim() ||
      'I wanted to let you no that the meeting has been moved to wendsday becuase of a problim with the room booking';
    if (!tryText.trim()) setTryText(input);
    setTryLoading(true);
    setTryResult('');
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const result = await res.json();
      setTryResult(result.simplifiedText || result.text || result.result || input);
    } catch {
      setTryResult('I wanted to let you know that the meeting has been moved to Wednesday because of a problem with the room booking.');
    } finally {
      setTryLoading(false);
    }
  }, [tryText]);

  const toggleFeature = (feat: Feature) => {
    setData(prev => ({
      ...prev,
      features: prev.features.includes(feat)
        ? prev.features.filter(f => f !== feat)
        : [...prev.features, feat],
    }));
  };

  const ProgressDots = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{
          width: i === step ? 28 : 10,
          height: 10,
          borderRadius: i === step ? 5 : '50%',
          background: i <= step ? '#1D9E75' : '#E8E6DE',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );

  const isDark = data.bgColour === '#2C2C2A';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      background: data.bgColour,
      transition: 'background 0.5s ease',
      fontFamily: "'Lexend', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 540 }}>
        <ProgressDots />

        {/* ══ STEP 0: WELCOME ══ */}
        {step === 0 && (
          <div style={card}>
            <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 20 }}>📝</div>
            <h1 style={{ ...title, textAlign: 'center' }}>Hi {firstName}! Welcome to DyslexiaWrite</h1>
            <p style={{ ...sub, textAlign: 'center' }}>
              You're in the right place. Let's set things up so the app works the way your brain works. This takes about 2 minutes.
            </p>
            <button style={primary} onClick={() => goTo(1)}>Let's get started</button>
            <button style={skip} onClick={() => completeOnboarding('write')}>Skip setup, take me to the app</button>
          </div>
        )}

        {/* ══ STEP 1: USER TYPE ══ */}
        {step === 1 && (
          <div style={card}>
            <div style={label}>Step 1 of 5</div>
            <h1 style={title}>How will you use DyslexiaWrite?</h1>
            <p style={sub}>This helps us show you the right tools first.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {USER_TYPES.map(ut => (
                <div key={ut.id}
                  onClick={() => setData(prev => ({ ...prev, userType: ut.id }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px', borderRadius: 12,
                    border: `1.5px solid ${data.userType === ut.id ? '#1D9E75' : '#E8E6DE'}`,
                    background: data.userType === ut.id ? '#E1F5EE' : '#fff',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: 24, width: 44, height: 44, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: data.userType === ut.id ? '#E1F5EE' : '#F1EFE8',
                  }}>{ut.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{ut.title}</div>
                    <div style={{ fontSize: 13, color: '#888780' }}>{ut.desc}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `1.5px solid ${data.userType === ut.id ? '#1D9E75' : '#E8E6DE'}`,
                    background: data.userType === ut.id ? '#1D9E75' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13,
                  }}>
                    {data.userType === ut.id ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button style={secondary} onClick={() => goTo(0)}>Back</button>
              <button style={{ ...primary, opacity: data.userType ? 1 : 0.5 }}
                onClick={() => data.userType && goTo(2)} disabled={!data.userType}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2: COMFORT SETTINGS ══ */}
        {step === 2 && (
          <div style={card}>
            <div style={label}>Step 2 of 5</div>
            <h1 style={title}>Make it comfortable</h1>
            <p style={sub}>Pick what feels easiest to read. You can change these anytime.</p>

            <div style={{ marginBottom: 20 }}>
              <div style={prefLabel}>Font</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FONTS.map(f => (
                  <button key={f.id}
                    onClick={() => setData(prev => ({ ...prev, font: f.id }))}
                    style={{
                      padding: '8px 16px', borderRadius: 20,
                      border: `1.5px solid ${data.font === f.id ? '#1D9E75' : '#E8E6DE'}`,
                      background: data.font === f.id ? '#E1F5EE' : '#fff',
                      color: data.font === f.id ? '#085041' : '#2C2C2A',
                      fontFamily: f.family, fontSize: 13, cursor: 'pointer',
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={prefLabel}>Background colour</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {BG_COLOURS.map(c => (
                  <div key={c.id}
                    onClick={() => setData(prev => ({ ...prev, bgColour: c.id }))}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: c.id, cursor: 'pointer',
                      border: `2px solid ${data.bgColour === c.id ? '#1D9E75' : '#E8E6DE'}`,
                      boxShadow: data.bgColour === c.id ? '0 0 0 3px #E1F5EE' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={prefLabel}>Text size: {data.fontSize}px</div>
              <input type="range" min={14} max={24} step={1} value={data.fontSize}
                onChange={e => setData(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#1D9E75' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={prefLabel}>Preview</div>
              <div style={{
                fontFamily: FONTS.find(f => f.id === data.font)?.family,
                fontSize: data.fontSize,
                lineHeight: 1.6 + (data.fontSize - 14) * 0.03,
                letterSpacing: `${0.02 + (data.fontSize - 14) * 0.005}em`,
                padding: 14, borderRadius: 10,
                border: '1px solid #E8E6DE',
                background: isDark ? '#3a3a38' : data.bgColour,
                color: isDark ? '#e0e0e0' : '#2C2C2A',
                transition: 'all 0.3s',
              }}>
                Welcome to DyslexiaWrite. This is how your text will look.
                We've picked settings that work well for most dyslexic readers, but you're in control.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button style={secondary} onClick={() => goTo(1)}>Back</button>
              <button style={primary} onClick={() => goTo(3)}>Looks good</button>
            </div>
          </div>
        )}

        {/* ══ STEP 3: TRY IT ══ */}
        {step === 3 && (
          <div style={card}>
            <div style={label}>Step 3 of 5</div>
            <h1 style={title}>Try it right now</h1>
            <p style={sub}>Type or paste something you've written. We'll show you what DyslexiaWrite can do.</p>

            <textarea value={tryText} onChange={e => setTryText(e.target.value)}
              placeholder="Try typing something like: I wanted to let you no that the meeting has been moved to wendsday becuase of a problim with the room booking"
              style={{
                width: '100%', padding: 14, borderRadius: 10,
                border: '1.5px solid #E8E6DE', fontFamily: "'Lexend', sans-serif",
                fontSize: 15, lineHeight: 1.6, resize: 'none', height: 80,
                color: '#2C2C2A', boxSizing: 'border-box',
              }}
            />

            <button style={{ ...primary, marginTop: 10 }} onClick={handleTrySimplify} disabled={tryLoading}>
              {tryLoading ? '✨ Working on it...' : 'Simplify this'}
            </button>

            {tryResult && (
              <div style={{
                marginTop: 12, padding: 14, borderRadius: 10,
                background: '#E1F5EE', border: '1px solid #9FE1CB',
                fontSize: 15, lineHeight: 1.6, color: '#085041',
              }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1D9E75', marginBottom: 6 }}>
                  Here's your improved version:
                </div>
                {tryResult}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button style={secondary} onClick={() => goTo(2)}>Back</button>
              <button style={primary} onClick={() => goTo(4)}>Continue</button>
            </div>
            <button style={skip} onClick={() => goTo(4)}>Skip this step</button>
          </div>
        )}

        {/* ══ STEP 4: FEATURE PRIORITIES ══ */}
        {step === 4 && (
          <div style={card}>
            <div style={label}>Step 4 of 5</div>
            <h1 style={title}>What would help you most?</h1>
            <p style={sub}>Pick as many as you like. We'll put these tools front and centre.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {FEATURES.map(feat => (
                <div key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  style={{
                    padding: 14, borderRadius: 10, textAlign: 'center',
                    border: `1.5px solid ${data.features.includes(feat.id) ? '#1D9E75' : '#E8E6DE'}`,
                    background: data.features.includes(feat.id) ? '#E1F5EE' : '#fff',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  <span style={{ fontSize: 22, display: 'block', marginBottom: 6 }}>{feat.icon}</span>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{feat.name}</div>
                  <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{feat.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button style={secondary} onClick={() => goTo(3)}>Back</button>
              <button style={primary} onClick={() => goTo(5)}>Continue</button>
            </div>
          </div>
        )}

        {/* ══ STEP 5: READY ══ */}
        {step === 5 && (
          <div style={card}>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h1 style={{ ...title, textAlign: 'center' }}>You're all set!</h1>
            <p style={{ ...sub, textAlign: 'center' }}>DyslexiaWrite is ready and personalised for you.</p>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
              {[
                'Your preferred font and colours are saved',
                'Text size set to your comfort level',
                'Your most-needed tools are ready',
              ].map((item, i) => (
                <li key={i} style={{
                  padding: '8px 0', fontSize: 14, display: 'flex',
                  alignItems: 'center', gap: 10,
                  borderBottom: i < 2 ? '1px solid #E8E6DE' : 'none',
                }}>
                  <span style={{ color: '#1D9E75', fontSize: 16, fontWeight: 600 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <p style={{ fontSize: 14, color: '#888780', marginBottom: 8, fontWeight: 500 }}>
              What would you like to do first?
            </p>

            {[
              { action: 'write', icon: '✍️', label: 'Start writing something' },
              { action: 'decode', icon: '📷', label: 'Decode a document' },
              { action: 'extension', icon: '🌐', label: 'Get the Chrome extension' },
            ].map(item => (
              <div key={item.action}
                onClick={() => !saving && completeOnboarding(item.action)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, borderRadius: 10, border: '1px solid #E8E6DE',
                  marginBottom: 8, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1, transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                <span style={{ marginLeft: 'auto', color: '#B4B2A9', fontSize: 16 }}>→</span>
              </div>
            ))}

            {saving && (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#1D9E75', marginTop: 12 }}>
                Saving your preferences...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20, padding: '40px 32px',
  border: '1px solid #E8E6DE',
};
const title: React.CSSProperties = {
  fontSize: 26, fontWeight: 600, lineHeight: 1.3, marginBottom: 8, color: '#2C2C2A',
};
const sub: React.CSSProperties = {
  fontSize: 15, color: '#888780', lineHeight: 1.6, marginBottom: 28,
};
const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: '#1D9E75', textTransform: 'uppercase',
  letterSpacing: 1.5, marginBottom: 10,
};
const prefLabel: React.CSSProperties = {
  fontSize: 13, fontWeight: 500, color: '#888780', marginBottom: 8,
};
const primary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '100%', padding: '14px 28px', borderRadius: 12,
  background: '#1D9E75', color: '#fff', fontSize: 15, fontWeight: 500,
  border: 'none', cursor: 'pointer', fontFamily: "'Lexend', system-ui, sans-serif",
};
const secondary: React.CSSProperties = {
  padding: '14px 28px', borderRadius: 12, background: 'transparent',
  color: '#888780', fontSize: 15, fontWeight: 500,
  border: '1px solid #E8E6DE', cursor: 'pointer',
  fontFamily: "'Lexend', system-ui, sans-serif",
};
const skip: React.CSSProperties = {
  display: 'block', width: '100%', fontSize: 13, color: '#B4B2A9',
  background: 'none', border: 'none', cursor: 'pointer', marginTop: 16,
  textAlign: 'center', fontFamily: "'Lexend', system-ui, sans-serif",
};

'use client';

import { useUser } from '@clerk/nextjs';

export default SpeechControls;

type SpeechControlsProps = {
  text: string;
  isReading: boolean;
  setIsReadingAction: (value: boolean) => void;
};

export function SpeechControls({ text, isReading, setIsReadingAction }: SpeechControlsProps) {
  const { user } = useUser();
  const isPro = user?.publicMetadata?.isPro === true;

  const speak = () => {
    if (!text.trim()) return;
    setIsReadingAction(true);
    // Call your text-to-speech API
  };

  return (
    <button onClick={speak} disabled={!isPro && text.length > 200}>
      {isReading ? '⏹️ Stop' : '▶️ Speak'}
    </button>
  );
}
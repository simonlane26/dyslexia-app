// src/lib/speechRecognition.ts
export function startSpeechRecognition(callback: (text: string) => void) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    callback(transcript);
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error', event.error);
  };

  recognition.start();
}
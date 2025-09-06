export async function speakWithElevenLabs(text: string, voiceId: string) {
  const res = await fetch('/api/text-to-speech', {
    method: 'POST',
    body: JSON.stringify({ text, voiceId })
  });
  const audioBlob = await res.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}
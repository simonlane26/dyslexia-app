import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    hasKey: !!process.env.ELEVENLABS_API_KEY,
    key: process.env.ELEVENLABS_API_KEY
      ? `${process.env.ELEVENLABS_API_KEY.slice(0, 10)}...`
      : 'NOT LOADED',
    nodeEnv: process.env.NODE_ENV,
  });
}
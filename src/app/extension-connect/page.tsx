'use client';
import dynamic from 'next/dynamic';

const ExtensionConnectClient = dynamic(() => import('./client'), { ssr: false });

export default function ExtensionConnectPage() {
  return <ExtensionConnectClient />;
}

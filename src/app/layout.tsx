import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head />
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

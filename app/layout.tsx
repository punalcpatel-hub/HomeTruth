import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HomeTruth',
  description: 'Know the home before you buy the home.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

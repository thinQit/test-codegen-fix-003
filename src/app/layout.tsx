import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'A simple task manager with authentication, task tracking, and analytics.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;

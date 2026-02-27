'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/tasks/new', label: 'New Task' },
  { href: '/profile', label: 'Profile' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="text-lg font-semibold text-foreground" aria-label="Task Manager home">
          Task Manager
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-md border border-border p-2 text-foreground sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {loading ? (
            <span className="text-sm text-secondary">Loading...</span>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">Hi, {user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 sm:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {loading ? (
              <span className="text-sm text-secondary">Loading...</span>
            ) : isAuthenticated && user ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-secondary">Signed in as {user.name}</span>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" fullWidth>Login</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;

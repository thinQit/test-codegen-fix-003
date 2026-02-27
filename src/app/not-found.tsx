import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold">404 - Page not found</h1>
      <p className="text-secondary">The page you are looking for does not exist.</p>
      <Link href="/" aria-label="Go to dashboard">
        <Button variant="primary">Back to Dashboard</Button>
      </Link>
    </div>
  );
}

export default NotFound;

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple debug page that redirects to home
export default function DebugApiPage() {
  const router = useRouter();
  
  // Redirect to home on client-side
  useEffect(() => {
    // Add a small delay to ensure the router is ready
    const timer = setTimeout(() => {
      router.push('/');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to home page...</p>
    </div>
  );
}
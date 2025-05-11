"use client";
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function GoogleButton({ onClick, loading, className = '' }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center space-x-2 border-gray-300 ${className}`}
    >
      {loading ? (
        <div className="h-5 w-5 border-t-2 border-b-2 border-gray-800 rounded-full animate-spin" />
      ) : (
        <Image 
          src="/Google.png" 
          alt="Google Logo" 
          width={20} 
          height={20} 
          className="mr-2"
        />
      )}
      <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
    </Button>
  );
}

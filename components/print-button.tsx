'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrintButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PrintButton({ variant = 'outline', size = 'default', className }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrint}
      className={`no-print ${className || ''}`}
    >
      <Printer className="h-4 w-4 mr-2" />
      Imprimer
    </Button>
  );
}

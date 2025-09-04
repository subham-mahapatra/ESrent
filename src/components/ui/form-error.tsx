'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormError {
  field?: string;
  message: string;
  type?: 'validation' | 'api' | 'network' | 'upload';
}

interface FormErrorDisplayProps {
  error: FormError | string | null;
  onDismiss?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function FormErrorDisplay({ 
  error, 
  onDismiss, 
  className,
  variant = 'default' 
}: FormErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorType = typeof error === 'string' ? 'validation' : error.type || 'validation';

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{errorMessage}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-destructive/70 hover:text-destructive transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-destructive/70 hover:text-destructive transition-colors ml-2"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface FieldErrorProps {
  error?: string | null;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={cn("flex items-center gap-1 text-sm text-destructive mt-1", className)}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

interface FormErrorsProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormErrors({ errors, className }: FormErrorsProps) {
  const errorEntries = Object.entries(errors).filter(([_, message]) => message);
  
  if (errorEntries.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {errorEntries.map(([field, message]) => (
        <FormErrorDisplay
          key={field}
          error={{ field, message, type: 'validation' }}
          variant="compact"
        />
      ))}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { FormError } from '@/components/ui/form-error';

export interface ApiError {
  message: string;
  status?: number;
  field?: string;
  code?: string;
}

export function useApiError() {
  const [error, setErrorState] = useState<FormError | null>(null);

  const handleApiError = useCallback((error: any): FormError => {
    console.error('API Error:', error);

    let formError: FormError;

    if (error?.response?.data) {
      // Axios-style error
      const { data, status } = error.response;
      formError = {
        message: data.message || data.error || 'An error occurred',
        type: 'api',
        field: data.field
      };
    } else if (error?.message) {
      // Standard Error object
      formError = {
        message: error.message,
        type: getErrorType(error.message)
      };
    } else if (typeof error === 'string') {
      // String error
      formError = {
        message: error,
        type: 'api'
      };
    } else {
      // Unknown error
      formError = {
        message: 'An unexpected error occurred',
        type: 'api'
      };
    }

    setErrorState(formError);
    return formError;
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const setError = useCallback((error: FormError | string | null) => {
    if (typeof error === 'string') {
      setErrorState({ message: error, type: 'api' });
    } else {
      setErrorState(error);
    }
  }, []);

  return {
    error,
    handleApiError,
    clearError,
    setError
  };
}

function getErrorType(message: string): FormError['type'] {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return 'network';
  }
  
  if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return 'upload';
  }
  
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
    return 'validation';
  }
  
  return 'api';
}

// Helper function to extract field-specific errors from API response
export function extractFieldErrors(error: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error?.response?.data?.errors) {
    // Handle validation errors object
    const errors = error.response.data.errors;
    for (const [field, messages] of Object.entries(errors)) {
      if (Array.isArray(messages)) {
        fieldErrors[field] = messages[0] as string;
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    }
  } else if (error?.response?.data?.field) {
    // Handle single field error
    fieldErrors[error.response.data.field] = error.response.data.message || 'Invalid value';
  }

  return fieldErrors;
}

// Helper function to get user-friendly error messages
export function getUserFriendlyMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Authentication errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Authentication expired. Please log in again.';
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }
    
    // File upload errors
    if (message.includes('413') || message.includes('too large')) {
      return 'File is too large. Please reduce the file size and try again.';
    }
    
    if (message.includes('invalid file type')) {
      return 'Invalid file type. Please check the file format and try again.';
    }
    
    // Server errors
    if (message.includes('500') || message.includes('internal server error')) {
      return 'Server error. Please try again later.';
    }
    
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

'use client';

import { useState, useCallback, useMemo } from 'react';
import { ValidationRules, ValidationErrors, validateForm, validateField as validateFieldFn } from '@/components/ui/form-validation';

export interface UseFormValidationOptions<T> {
  initialData: T;
  validationRules: ValidationRules;
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (errors: ValidationErrors) => void;
}

export interface UseFormValidationReturn<T> {
  data: T;
  errors: ValidationErrors;
  isSubmitting: boolean;
  isValid: boolean;
  setData: (data: Partial<T>) => void;
  setField: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, any>>({
  initialData,
  validationRules,
  onSubmit,
  onError
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [data, setDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => {
    const validationErrors = validateForm(data, validationRules);
    return Object.keys(validationErrors).length === 0;
  }, [data, validationRules]);

  const setData = useCallback((newData: Partial<T>) => {
    setDataState(prev => ({ ...prev, ...newData }));
  }, []);

  const setField = useCallback((field: keyof T, value: any) => {
    setDataState(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validate = useCallback(() => {
    const validationErrors = validateForm(data, validationRules);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      onError?.(validationErrors);
      return false;
    }
    
    return true;
  }, [data, validationRules, onError]);

  const validateField = useCallback((field: keyof T) => {
    const fieldRules = validationRules[field as string];
    if (!fieldRules) return true;

    const value = data[field];
    const error = validateFieldFn(value, fieldRules);
    
    if (error) {
      setError(field, error);
      return false;
    } else {
      clearError(field);
      return true;
    }
  }, [data, validationRules, setError, clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle API errors here if needed
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validate, onSubmit]);

  const reset = useCallback(() => {
    setDataState(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    data,
    errors,
    isSubmitting,
    isValid,
    setData,
    setField,
    setError,
    clearError,
    clearAllErrors,
    validate,
    validateField,
    handleSubmit,
    reset
  };
}

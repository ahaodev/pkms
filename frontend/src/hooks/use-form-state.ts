import { useState, useCallback } from 'react';

export function useFormState<T>(initialData: T) {
    const [formData, setFormData] = useState<T>(initialData);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = useCallback(() => {
        setFormData(initialData);
        setError(null);
    }, [initialData]);

    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null); // Clear error when user makes changes
    }, []);

    const setFormError = useCallback((errorMessage: string | null) => {
        setError(errorMessage);
    }, []);

    const setFormLoading = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, []);

    return {
        formData,
        error,
        isLoading,
        resetForm,
        updateField,
        setFormError,
        setFormLoading,
        setFormData
    };
}
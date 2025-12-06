'use client';

import { useState, useEffect, FormEvent } from 'react';
import { SafeInput, SafeTextarea } from './SafeHTML';
import SafeHTML from './SafeHTML';
import { getCSRFTokenFromClient, secureFetch } from '@/lib/csrf-protection';

interface SecureFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  className?: string;
  children: React.ReactNode;
}

export default function SecureForm({ 
  onSubmit, 
  initialData = {}, 
  className = '',
  children 
}: SecureFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // CSRF token'ı yükle
  useEffect(() => {
    const token = getCSRFTokenFromClient();
    setCsrfToken(token);
  }, []);

  // Form verilerini güvenli şekilde güncelle
  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    
    // Hata temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field kontrolü
    Object.keys(formData).forEach(key => {
      if (!formData[key] && formData[key] !== 0) {
        newErrors[key] = `${key} gereklidir`;
      }
    });

    // Email validasyonu
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Geçerli bir email adresi giriniz';
      }
    }

    // Şifre validasyonu
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Şifre en az 8 karakter olmalıdır';
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir';
      }
    }

    // Telefon validasyonu
    if (formData.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Geçerli bir telefon numarası giriniz';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!csrfToken) {
      setErrors({ general: 'CSRF token bulunamadı' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Bir hata oluştu' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* CSRF Token */}
      <input type="hidden" name="_csrf" value={csrfToken || ''} />
      
      {/* Genel hata mesajı */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <SafeHTML content={errors.general} />
        </div>
      )}

      {/* Form içeriği */}
      {children}

      {/* Submit butonu */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting || !csrfToken}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>
    </form>
  );
}

// Güvenli input wrapper
interface SecureFormInputProps {
  name: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function SecureFormInput({
  name,
  type,
  label,
  placeholder = '',
  required = false,
  value,
  onChange,
  error,
  className = ''
}: SecureFormInputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <SafeInput
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        maxLength={type === 'email' ? 255 : type === 'password' ? 128 : 100}
        pattern={type === 'email' ? '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' : undefined}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          <SafeHTML content={error} />
        </p>
      )}
    </div>
  );
}

// Güvenli textarea wrapper
interface SecureFormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
  className?: string;
}

export function SecureFormTextarea({
  name,
  label,
  placeholder = '',
  required = false,
  value,
  onChange,
  error,
  rows = 4,
  className = ''
}: SecureFormTextareaProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <SafeTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        maxLength={1000}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          <SafeHTML content={error} />
        </p>
      )}
    </div>
  );
}


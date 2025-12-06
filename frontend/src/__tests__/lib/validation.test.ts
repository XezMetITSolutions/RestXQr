import { describe, it, expect } from '@jest/globals';
import {
  sanitizeHtml,
  sanitizeString,
  emailSchema,
  passwordSchema,
  userRegistrationSchema,
  safeValidate,
  createSecureResponse,
  createErrorResponse,
} from '@/lib/validation';

describe('validation lib', () => {
  it('sanitizeHtml XSS içeriğini temizler', () => {
    const input = '<img src=x onerror=alert(1)><b>ok</b>';
    const out = sanitizeHtml(input);
    expect(out).toBe('<b>ok</b>');
  });

  it('sanitizeString tehlikeli karakterleri temizler', () => {
    const out = sanitizeString("Robert'); DROP TABLE users; --");
    expect(out.includes("'")).toBe(false);
    expect(out.includes(';')).toBe(false);
  });

  it('emailSchema geçerli emaili kabul eder ve normalize eder', () => {
    const res = emailSchema.parse('TEST@EXAMPLE.COM ');
    expect(res).toBe('test@example.com');
  });

  it('passwordSchema güçlü şifre ister', () => {
    expect(() => passwordSchema.parse('weak')).toThrow();
    expect(() => passwordSchema.parse('Aa1!aaaa')).not.toThrow();
  });

  it('userRegistrationSchema geçerli veriyi kabul eder', () => {
    const data = {
      name: 'Ali Veli',
      email: 'user@test.com',
      password: 'Aa1!aaaa',
      phone: '+905551112233',
    };
    expect(() => userRegistrationSchema.parse(data)).not.toThrow();
  });

  it('safeValidate hataları yakalar', () => {
    const invalid = { email: 'bad', password: '123' };
    const res = safeValidate(userRegistrationSchema, invalid);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('createSecureResponse tutarlı şema döndürür', () => {
    const res = createSecureResponse({ ok: true }, 'done');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ ok: true });
    expect(res.message).toBe('done');
    expect(typeof res.timestamp).toBe('string');
  });

  it('createErrorResponse tutarlı şema döndürür', () => {
    const res = createErrorResponse('fail', 'E001');
    expect(res.success).toBe(false);
    expect(res.error).toBe('fail');
    expect(res.code).toBe('E001');
    expect(typeof res.timestamp).toBe('string');
  });
});



/* @jest-environment node */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/subscriptions/route';

// Auth mock (route uses '@/lib/auth')
jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}));

// Mock database
const mockSubscriptions = [
  {
    id: '1',
    userId: 'user1',
    planId: 'basic',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    userId: 'user2',
    planId: 'premium',
    status: 'pending',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    createdAt: '2024-01-15T00:00:00Z'
  }
];

describe('/api/admin/subscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns subscriptions for authenticated super_admin (cookie token)', async () => {
      const { verifyToken } = require('@/lib/auth');
      verifyToken.mockReturnValue({ userId: 'admin1', role: 'super_admin' });

      const request = new NextRequest('http://localhost:3000/api/admin/subscriptions', {
        headers: {
          cookie: 'accessToken=valid-token'
        }
      } as any);

      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('returns 401 when no accessToken cookie', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/subscriptions');
      const response = await GET(request as any);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('returns 403 for non-super_admin role', async () => {
      const { verifyToken } = require('@/lib/auth');
      verifyToken.mockReturnValue({ userId: 'user1', role: 'customer' });

      const request = new NextRequest('http://localhost:3000/api/admin/subscriptions', {
        headers: {
          cookie: 'accessToken=valid-token'
        }
      } as any);

      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
    });

    it('handles query parameters correctly', async () => {
      const { verifyToken } = require('@/lib/auth');
      verifyToken.mockReturnValue({ userId: 'admin1', role: 'super_admin' });

      const request = new NextRequest('http://localhost:3000/api/admin/subscriptions?status=active&page=1&limit=10', {
        headers: { cookie: 'accessToken=valid-token' }
      } as any);

      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // POST route bu modülde implement edilmediği için kapsam dışı
});

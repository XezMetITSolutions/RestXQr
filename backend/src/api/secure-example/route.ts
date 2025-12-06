import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, createSecureResponse, createErrorResponse } from '@/lib/security-headers';
import { withCSRFProtection } from '@/lib/csrf-protection';
import { authRateLimit } from '@/lib/rate-limiting';
import { safeValidate, userRegistrationSchema } from '@/lib/validation';
import { verifyToken } from '@/lib/auth-security';

// Güvenli API endpoint örneği
export const POST = withSecurity(
  withCSRFProtection(
    authRateLimit(
      async (request: NextRequest) => {
        try {
          // Authentication kontrolü
          const authHeader = request.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED');
          }

          const token = authHeader.substring(7);
          const payload = verifyToken(token);
          
          if (!payload) {
            return createErrorResponse('Invalid token', 401, 'INVALID_TOKEN');
          }

          // Request body validasyonu
          const body = await request.json();
          const validation = safeValidate(userRegistrationSchema, body);
          
          if (!validation.success) {
            return createErrorResponse(
              validation.error || 'Validation failed',
              400,
              'VALIDATION_ERROR'
            );
          }

          // Güvenli veri işleme
          const userData = validation.data;
          
          // Simulated user creation
          const newUser = {
            id: crypto.randomUUID(),
            ...userData,
            createdAt: new Date().toISOString(),
            createdBy: payload.userId
          };

          // Güvenli response
          return createSecureResponse({
            success: true,
            data: newUser,
            message: 'User created successfully'
          }, 201);

        } catch (error) {
          console.error('API error:', error);
          return createErrorResponse(
            'Internal server error',
            500,
            'INTERNAL_ERROR'
          );
        }
      }
    )
  )
);

// GET endpoint (daha az kısıtlı)
export const GET = withSecurity(
  async (request: NextRequest) => {
    try {
      // Query parametrelerini güvenli şekilde al
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      // Parametre validasyonu
      if (page < 1 || page > 1000) {
        return createErrorResponse('Invalid page parameter', 400, 'INVALID_PAGE');
      }

      if (limit < 1 || limit > 100) {
        return createErrorResponse('Invalid limit parameter', 400, 'INVALID_LIMIT');
      }

      // Simulated data fetch
      const data = {
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };

      return createSecureResponse(data);

    } catch (error) {
      console.error('GET API error:', error);
      return createErrorResponse(
        'Internal server error',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
);

// OPTIONS endpoint (CORS için)
export const OPTIONS = async (request: NextRequest) => {
  const response = new NextResponse(null, { status: 200 });
  
  // CORS başlıklarını ekle
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
};

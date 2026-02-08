/**
 * Admin/Company panel API helper.
 * 401 alındığında refresh token ile yeni access token alıp isteği bir kez daha dener.
 */

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
  const base = (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/+$/, '');
  return base + (raw.endsWith('/api') || raw.endsWith('/api/') ? '' : '/api');
}

export async function fetchWithAdminAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;

  const doFetch = (accessToken: string | null): Promise<Response> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };
    if (accessToken) (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    return fetch(url, { ...options, headers });
  };

  let response = await doFetch(token);
  if (response.status !== 401) return response;

  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('admin_refresh_token') : null;
  if (!refreshToken) return response;

  const refreshRes = await fetch(`${base}/admin/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const refreshData = await refreshRes.json().catch(() => ({}));
  const newAccessToken = refreshData?.data?.accessToken;

  if (newAccessToken && typeof window !== 'undefined') {
    localStorage.setItem('admin_access_token', newAccessToken);
    return doFetch(newAccessToken);
  }

  return response;
}

export { getBaseUrl as getAdminApiUrl };

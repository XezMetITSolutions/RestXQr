exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // URL'den subdomain'i çıkar
    const pathParts = event.path.split('/');
    const subdomain = pathParts[pathParts.length - 1];

    if (!subdomain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          exists: false,
          message: 'Subdomain gerekli'
        })
      };
    }

    // Demo subdomain veritabanı
    const subdomains = [
      {
        subdomain: 'kardesler',
        restaurantId: 'rest-1',
        restaurantName: 'Kardeşler Restoran',
        active: true,
        createdAt: '2024-03-15T08:00:00Z',
        plan: 'premium',
        ownerEmail: 'info@kardesler.com'
      },
      {
        subdomain: 'pizza-palace',
        restaurantId: 'rest-2',
        restaurantName: 'Pizza Palace',
        active: false,
        createdAt: '2024-03-20T10:30:00Z',
        plan: 'basic',
        ownerEmail: 'info@pizzapalace.com'
      }
    ];

    // Subdomain format kontrolü
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          exists: false,
          message: 'Geçersiz subdomain formatı'
        })
      };
    }

    // Subdomain'i bul
    const subdomainData = subdomains.find(s => s.subdomain === subdomain);

    if (!subdomainData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          exists: false,
          message: 'Subdomain bulunamadı'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        exists: true,
        active: subdomainData.active,
        subdomain: subdomainData.subdomain,
        restaurantId: subdomainData.restaurantId,
        restaurantName: subdomainData.restaurantName,
        plan: subdomainData.plan,
        createdAt: subdomainData.createdAt,
        ownerEmail: subdomainData.ownerEmail
      })
    };

  } catch (error) {
    console.error('Subdomain validation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        exists: false,
        message: 'Sunucu hatası'
      })
    };
  }
};

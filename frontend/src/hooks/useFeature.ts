import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useEffect, useState, useMemo } from 'react';

const RESERVED_SUBDOMAINS = ['restxqr', 'www', 'localhost', '127', '127.0.0.1'];

const detectDemoRoute = () => 
  typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');

const getActiveSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;

  const rawHostname = window.location.hostname?.toLowerCase() || '';
  if (!rawHostname) return null;

  const hostname = rawHostname.split(':')[0]; // strip port if present

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  if (hostname.endsWith('.localhost')) {
    const sub = hostname.replace('.localhost', '');
    if (!sub || RESERVED_SUBDOMAINS.includes(sub)) return null;
    return sub;
  }

  const parts = hostname.split('.');
  if (parts.length <= 2) return null;

  const subdomain = parts[0];
  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) return null;

  return subdomain;
};

/**
 * Restaurant'a özel özellik kontrolü için hook - REAL-TIME
 * Backend'den canlı veri çeker, localStorage kullanmaz
 * 
 * @param featureId - Kontrol edilecek özellik ID'si
 * @returns boolean - Özellik aktif mi?
 */
export function useFeature(featureId: string): boolean {
  const { authenticatedRestaurant } = useAuthStore();
  const { restaurants = [], fetchRestaurantByUsername } = useRestaurantStore();
  const [loading, setLoading] = useState(false);
  
  // Demo panelde tüm özellikler aktif
  const isDemo = detectDemoRoute();
  if (isDemo) {
    console.log('📦 useFeature: Demo mode - all features enabled');
    return true;
  }
  
  // Real-time data fetch için subdomain'i al ve backend'den çek
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const demoMode = detectDemoRoute();
    if (demoMode) {
      console.log('📦 useFeature: Demo mode, skipping fetch');
      return;
    }
    
    const subdomain = getActiveSubdomain();
    if (!subdomain) {
      console.log('ℹ️ useFeature: No subdomain detected, skipping fetch');
      return;
    }

    console.log('🔍 useFeature: Fetching data for subdomain:', subdomain);
    setLoading(true);
    fetchRestaurantByUsername(subdomain)
      .catch((error) => {
        console.warn('⚠️ useFeature: fetchRestaurantByUsername failed', error);
      })
      .finally(() => {
        setLoading(false);
        console.log('✅ useFeature: Fetch completed for subdomain:', subdomain);
      });
  }, [fetchRestaurantByUsername]);
  
  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const subdomain = getActiveSubdomain();
      const restaurant = subdomain && Array.isArray(restaurants) 
        ? restaurants.find(r => r && r.username === subdomain) 
        : null;
      console.log('🎯 useFeature Debug:', {
        featureId,
        subdomain,
        authenticatedRestaurant: authenticatedRestaurant?.features,
        restaurantFromStore: restaurant?.features,
        totalRestaurants: Array.isArray(restaurants) ? restaurants.length : 0
      });
    }
  }, [featureId, authenticatedRestaurant, restaurants]);
  
  // Plan bazlı özellik kontrolü - bazı özellikler plan'a göre otomatik aktif
  const checkFeatureByPlan = (plan: string | undefined, featureId: string): boolean => {
    // Premium, Corporate, Enterprise planlarında aktif olan özellikler
    const premiumFeatures = [
      'accounting_software',
      'event_management',
      'ai_recommendations',
      'inventory_management'
    ];
    if (premiumFeatures.includes(featureId)) {
      return plan === 'premium' || plan === 'corporate' || plan === 'enterprise';
    }
    
    // Corporate, Enterprise planlarında aktif olan özellikler
    const corporateFeatures = [
      'pos_integration',
      'delivery_integration',
      'multi_branch'
    ];
    if (corporateFeatures.includes(featureId)) {
      return plan === 'corporate' || plan === 'enterprise';
    }
    
    // Sadece Enterprise planında aktif olan özellikler
    const enterpriseFeatures = [
      'api_access'
    ];
    if (enterpriseFeatures.includes(featureId)) {
      return plan === 'enterprise';
    }
    
    return false;
  };

  // Önce authenticated restaurant'ı kontrol et
  if (authenticatedRestaurant) {
    console.log('🔐 useFeature: Using authenticated restaurant features:', authenticatedRestaurant.features);
    const plan = authenticatedRestaurant.subscriptionPlan || authenticatedRestaurant.subscription_plan;
    // Önce plan bazlı kontrolü yap
    if (checkFeatureByPlan(plan, featureId)) {
      console.log('✅ useFeature: Feature enabled by plan:', { plan, featureId });
      return true;
    }
    // Sonra features array'ini kontrol et
    return authenticatedRestaurant.features?.includes(featureId) ?? false;
  }
  
  // Authenticated yoksa subdomain'e göre restaurant bul (backend'den çekilmiş)
  const detectedSubdomain = getActiveSubdomain();
  if (detectedSubdomain && Array.isArray(restaurants)) {
    const restaurant = restaurants.find(r => r && r.username === detectedSubdomain);
    
    if (restaurant) {
      console.log('🏪 useFeature: Using restaurant from store:', restaurant.features);
      const plan = restaurant.subscriptionPlan || restaurant.subscription_plan;
      // Önce plan bazlı kontrolü yap
      if (checkFeatureByPlan(plan, featureId)) {
        console.log('✅ useFeature: Feature enabled by plan:', { plan, featureId });
        return true;
      }
      // Sonra features array'ini kontrol et
      return restaurant.features?.includes(featureId) ?? false;
    }
  }
  
  console.log('❌ useFeature: No features found, returning false');
  return false;
}

/**
 * Birden fazla özelliği kontrol etmek için hook
 * 
 * @param featureIds - Kontrol edilecek özellik ID'leri
 * @returns object - Her özellik için boolean değer
 * 
 * @example
 * const features = useFeatures(['google_reviews', 'online_ordering', 'loyalty_program']);
 * 
 * return (
 *   <>
 *     {features.google_reviews && <GoogleReviewsWidget />}
 *     {features.online_ordering && <OnlineOrderButton />}
 *     {features.loyalty_program && <LoyaltyPoints />}
 *   </>
 * );
 */
export function useFeatures(featureIds: string[]): Record<string, boolean> {
  const { authenticatedRestaurant } = useAuthStore();
  const { restaurants = [] } = useRestaurantStore();
  const [remoteFeatures, setRemoteFeatures] = useState<string[] | null>(null);

  // Demo panelde tüm özellikler aktif
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
  if (isDemo) {
    return featureIds.reduce((acc, id) => ({ ...acc, [id]: true }), {} as Record<string, boolean>);
  }

  const local = useMemo(() => {
    if (authenticatedRestaurant) {
      return featureIds.reduce((acc, id) => ({
        ...acc,
        [id]: authenticatedRestaurant.features?.includes(id) ?? false
      }), {} as Record<string, boolean>);
    }
    const subdomain = getActiveSubdomain();
    if (subdomain && Array.isArray(restaurants)) {
      const restaurant = restaurants.find(r => r && r.username === subdomain);
      if (restaurant) {
        return featureIds.reduce((acc, id) => ({
          ...acc,
          [id]: Array.isArray(restaurant.features) && restaurant.features.includes(id)
        }), {} as Record<string, boolean>);
      }
    }
    return null;
  }, [authenticatedRestaurant?.id, authenticatedRestaurant?.features, restaurants, featureIds.join('|')]);

  useEffect(() => {
    // Demo panelde backend'e gitme
    const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
    if (isDemo) {
      console.log('📦 useFeatures: Demo mode, skipping fetch');
      return;
    }
    
    if (local) return;
    if (authenticatedRestaurant) return;
    if (typeof window === 'undefined') return;
    const subdomain = getActiveSubdomain();
    if (!subdomain) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/restaurants/${encodeURIComponent(subdomain)}/features`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setRemoteFeatures(Array.isArray(data?.features) ? data.features : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [local, authenticatedRestaurant?.id, featureIds.join('|')]);

  if (local) return local;
  if (remoteFeatures) {
    return featureIds.reduce((acc, id) => ({ ...acc, [id]: remoteFeatures.includes(id) }), {} as Record<string, boolean>);
  }
  return featureIds.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<string, boolean>);
}

/**
 * Tüm aktif özellikleri döndüren hook
 * 
 * @returns string[] - Aktif özellik ID'leri
 * 
 * @example
 * const activeFeatures = useActiveFeatures();
 * console.log('Aktif özellikler:', activeFeatures);
 */
export function useActiveFeatures(): string[] {
  const { authenticatedRestaurant } = useAuthStore();
  const { restaurants = [] } = useRestaurantStore();
  const [remoteFeatures, setRemoteFeatures] = useState<string[] | null>(null);

  // Demo panelde tüm özellikler aktif - tüm mevcut özellikleri döndür
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
  if (isDemo) {
    return [
      'basic_reports',
      'advanced_analytics',
      'google_reviews',
      'online_ordering',
      'loyalty_program',
      'custom_branding',
      'multi_location',
      'api_access'
    ];
  }

  const local = useMemo(() => {
    if (authenticatedRestaurant) {
      return Array.isArray(authenticatedRestaurant.features) ? authenticatedRestaurant.features : [];
    }
    const subdomain = getActiveSubdomain();
    if (subdomain && Array.isArray(restaurants)) {
      const restaurant = restaurants.find(r => r && r.username === subdomain);
      if (restaurant) {
        return Array.isArray(restaurant.features) ? restaurant.features : [];
      }
    }
    return null;
  }, [authenticatedRestaurant?.id, authenticatedRestaurant?.features, restaurants]);

  useEffect(() => {
    // Demo panelde backend'e gitme
    const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/');
    if (isDemo) {
      console.log('📦 useActiveFeatures: Demo mode, skipping fetch');
      return;
    }
    
    if (local) return;
    if (authenticatedRestaurant) return;
    if (typeof window === 'undefined') return;
    const subdomain = getActiveSubdomain();
    if (!subdomain) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/restaurants/${encodeURIComponent(subdomain)}/features`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setRemoteFeatures(Array.isArray(data?.features) ? data.features : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [local, authenticatedRestaurant?.id]);

  return local ?? remoteFeatures ?? [];
}

/**
 * Özellik sayısını döndüren hook
 * 
 * @returns number - Aktif özellik sayısı
 */
export function useFeatureCount(): number {
  const local = useActiveFeatures();
  return Array.isArray(local) ? local.length : 0;
}

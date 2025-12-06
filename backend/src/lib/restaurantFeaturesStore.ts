// Simple shared in-memory store for features
const store: Map<string, string[]> = (global as any).__restaurantFeaturesStore || new Map();
(global as any).__restaurantFeaturesStore = store;

export function setRestaurantFeatures(restaurantId: string, features: string[]) {
  store.set(restaurantId, features);
}

export function getRestaurantFeaturesById(restaurantId: string): string[] {
  return store.get(restaurantId) ?? [];
}

export function getRestaurantFeaturesByUsername(username: string): { restaurantId: string; features: string[] } {
  // Demo: restaurantId = username; real app should resolve by DB
  const restaurantId = username;
  return { restaurantId, features: getRestaurantFeaturesById(restaurantId) };
}




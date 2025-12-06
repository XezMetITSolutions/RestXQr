// Real-time communication için basit pub/sub sistemi
const subscribers = new Map();

/**
 * Yeni bir subscriber ekle
 * @param {string} clientId - Client ID
 * @param {object} response - Express response object
 */
const addSubscriber = (clientId, response) => {
  subscribers.set(clientId, response);
  console.log(`📡 Client ${clientId} connected. Total subscribers: ${subscribers.size}`);
};

/**
 * Subscriber'ı kaldır
 * @param {string} clientId - Client ID
 */
const removeSubscriber = (clientId) => {
  if (subscribers.has(clientId)) {
    subscribers.delete(clientId);
    console.log(`📡 Client ${clientId} disconnected. Total subscribers: ${subscribers.size}`);
  }
};

/**
 * Tüm subscriber'lara mesaj gönder
 * @param {string} eventType - Event type (new_order, order_update, etc.)
 * @param {object} data - Data to send
 */
const publish = (eventType, data) => {
  const message = JSON.stringify({
    type: eventType,
    data: data,
    timestamp: new Date().toISOString()
  });

  console.log(`📢 Publishing ${eventType} to ${subscribers.size} subscribers:`, data);

  // Tüm subscriber'lara gönder
  for (const [clientId, response] of subscribers.entries()) {
    try {
      response.write(`data: ${message}\n\n`);
    } catch (error) {
      console.error(`❌ Error sending to client ${clientId}:`, error.message);
      // Bağlantı kopmuşsa subscriber'ı kaldır
      subscribers.delete(clientId);
    }
  }
};

/**
 * Belirli bir restaurant'a mesaj gönder
 * @param {string} restaurantId - Restaurant ID
 * @param {string} eventType - Event type
 * @param {object} data - Data to send
 */
const publishToRestaurant = (restaurantId, eventType, data) => {
  // Şimdilik tüm subscriber'lara gönder
  // Gelecekte restaurant-specific filtering eklenebilir
  publish(eventType, { ...data, restaurantId });
};

module.exports = {
  addSubscriber,
  removeSubscriber,
  publish,
  publishToRestaurant
};

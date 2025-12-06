const API_BASE = 'https://masapp-backend.onrender.com/api';

const testRestaurant = {
  name: 'Test Restoran',
  username: 'testrestoran',
  email: 'testrestoran@test.com',
  phone: '+90 555 123 4567',
  address: 'Test Adresi, İstanbul',
  password: 'test123',
  tableCount: 10,
  primaryColor: '#FF6B35',
  secondaryColor: '#F7931E'
};

async function createTestRestaurant() {
  console.log('🏪 Test Restoran oluşturuluyor...');
  
  try {
    const response = await fetch(`${API_BASE}/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRestaurant)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test Restoran oluşturuldu!');
      console.log('Restaurant ID:', result.data.id);
      console.log('Username:', result.data.username);
      return result.data.id;
    } else {
      const error = await response.text();
      console.error('❌ Test Restoran oluşturulamadı:', response.status, error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test Restoran oluşturulurken hata:', error);
    return null;
  }
}

createTestRestaurant();

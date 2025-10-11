// Quick backend connectivity test
// You can run this in your browser console to test the API

const testBackendConnection = async () => {
  const API_BASE_URL = 'http://localhost:8080/api/v1';
  
  console.log('🔍 Testing backend connectivity...');
  
  try {
    // Test 1: Check if backend is running
    console.log('📡 Testing basic connectivity...');
    const response = await fetch(`${API_BASE_URL}/products/get-products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Backend is connected!');
    console.log('📦 Products data:', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.log('🔧 Make sure your Spring Boot backend is running on http://localhost:8080');
    return null;
  }
};

// Call the test function
testBackendConnection();
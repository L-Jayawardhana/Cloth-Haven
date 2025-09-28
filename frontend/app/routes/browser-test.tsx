import { useState } from "react";

export default function BrowserTest() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testFromBrowser = async () => {
    setLoading(true);
    setResult("Testing from browser...");
    
    try {
      console.log("Testing from browser...");
      
      // Test 1: Simple fetch
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: "frontend@test.com", 
          password: "testpass123" 
        }),
      });
      
      console.log("Response:", response);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        setResult(`✅ SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ FAILED: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("Browser error:", error);
      setResult(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setResult("Testing registration...");
    
    try {
      console.log("Testing registration...");
      
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: "browsertest", 
          email: "browser@test.com", 
          phoneNo: "1234567890", 
          pw: "testpass123", 
          role: "CUSTOMER" 
        }),
      });
      
      console.log("Registration response:", response);
      const data = await response.json();
      console.log("Registration data:", data);
      
      if (response.ok) {
        setResult(`✅ REGISTRATION SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ REGISTRATION FAILED: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setResult(`❌ REGISTRATION ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    setResult("Testing health endpoint...");
    
    try {
      const response = await fetch("http://localhost:8080/actuator/health");
      const data = await response.json();
      setResult(`✅ HEALTH: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ HEALTH ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Browser API Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testHealth}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Test Health Endpoint
          </button>
          
          <button
            onClick={testRegistration}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Test Registration
          </button>
          
          <button
            onClick={testFromBrowser}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Test Login from Browser
          </button>
        </div>
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-4">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
        
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>Open browser console (F12)</li>
            <li>Click "Test Health Endpoint" first</li>
            <li>Click "Test Registration" to create account</li>
            <li>Click "Test Login from Browser"</li>
            <li>Check console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}



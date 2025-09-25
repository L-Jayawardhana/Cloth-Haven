import { useState } from "react";

export default function TestLogin() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("Testing login...");
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: "test@example.com", 
          password: "password123" 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ LOGIN SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ LOGIN FAILED: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ LOGIN ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setResult("Testing registration...");
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: "testuser2", 
          email: "test2@example.com", 
          phoneNo: "1234567890", 
          pw: "password123", 
          role: "CUSTOMER" 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ REGISTRATION SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ REGISTRATION FAILED: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ REGISTRATION ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Frontend-Backend Connection Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Test Login (test@example.com)
          </button>
          
          <button
            onClick={testRegister}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Test Registration (test2@example.com)
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
        
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Click "Test Login" to test login functionality</li>
            <li>Click "Test Registration" to test registration</li>
            <li>Check the result below</li>
            <li>If both work, the issue is in the main login/register forms</li>
          </ol>
        </div>
        
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Next Steps:</h3>
          <p className="text-yellow-700">
            If these tests work, try the main login page at <a href="/login" className="underline">/login</a> 
            and register page at <a href="/register" className="underline">/register</a>
          </p>
        </div>
      </div>
    </div>
  );
}



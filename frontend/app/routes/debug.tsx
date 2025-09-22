import { useState } from "react";
import { apiService } from "../lib/api";

export default function Debug() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("");
    
    try {
      console.log("Testing login with:", { email, password });
      
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        setResult(`✅ Login successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Login failed: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setResult("");
    
    try {
      console.log("Testing registration with:", { email, password });
      
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: "debuguser", 
          email, 
          phoneNo: "1234567890", 
          pw: password, 
          role: "CUSTOMER" 
        }),
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        setResult(`✅ Registration successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Registration failed: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiService = async () => {
    setLoading(true);
    setResult("");
    
    try {
      console.log("Testing API service login");
      const userData = await apiService.login({ email, password });
      setResult(`✅ API Service login successful: ${JSON.stringify(userData, null, 2)}`);
    } catch (error) {
      console.error("API Service error:", error);
      setResult(`❌ API Service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Login Issues</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="password123"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-3">
            <button
              onClick={testRegister}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Registration"}
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Direct Login"}
            </button>
            
            <button
              onClick={testApiService}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test API Service Login"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>First, test registration to create a new account</li>
            <li>Then test direct login to see if the API works</li>
            <li>Finally, test API service login to see if there's a frontend issue</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}



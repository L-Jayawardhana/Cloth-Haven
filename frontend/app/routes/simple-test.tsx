import { useState } from "react";

export default function SimpleTest() {
  const [email, setEmail] = useState("debug@test.com");
  const [password, setPassword] = useState("testpass123");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("Testing...");
    
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
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        setResult(`✅ SUCCESS: ${JSON.stringify(data)}`);
      } else {
        setResult(`❌ FAILED: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setResult(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Login Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Login"}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>This test uses the exact same credentials that work with curl:</p>
          <p>Email: debug@test.com</p>
          <p>Password: testpass123</p>
        </div>
      </div>
    </div>
  );
}



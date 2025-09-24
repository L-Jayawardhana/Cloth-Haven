import { useState } from "react";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"code" | "password">("code");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "Password reset successfully! You can now log in with your new password." });
        setToken("");
        setNewPassword("");
        setConfirmPassword("");
        setStep("code");
      } else {
        setMessage({ type: "error", text: data.message || "Failed to reset password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-8 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-2xl bg-gray-100 lg:block">
        <img
          src="https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=1600&auto=format&fit=crop"
          alt="Fashion"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-black/10" aria-hidden="true"></div>
        <div className="relative p-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-inset ring-white/20">Cloth Haven</div>
          <p className="mt-3 max-w-md text-sm text-white/90">Enter the verification code from your email and set a new password.</p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h1 className="text-xl font-semibold">Reset Password</h1>
          <p className="mt-1 text-sm text-gray-600">Enter the verification code and your new password</p>
          
          {message.text && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={(e)=>e.preventDefault()}>
            <div>
              <label className="block text-sm text-gray-700">Verification Code</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/20"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
              {step === "code" && (
                <button
                  type="button"
                  onClick={() => setStep("password")}
                  disabled={!token || token.length < 6}
                  className="mt-3 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:translate-y-px disabled:opacity-60"
                >
                  Continue
                </button>
              )}
            </div>

            {step === "password" && (
              <>
                <div>
                  <label className="block text-sm text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/20"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/20"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading || !token || !newPassword || !confirmPassword}
                  className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:translate-y-px disabled:opacity-60"
                >
                  {loading ? "Resetting..." : "Change Password"}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <a href="/forgot-password" className="font-medium text-gray-900 hover:underline">Resend code</a> • 
              <a href="/login" className="font-medium text-gray-900 hover:underline ml-2">Back to login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

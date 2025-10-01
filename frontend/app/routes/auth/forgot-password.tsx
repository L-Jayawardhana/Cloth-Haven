import { useState } from "react";
import { apiService } from "../../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [resendSeconds, setResendSeconds] = useState(0);
  const [timerId, setTimerId] = useState<number | null>(null);

  const startResendTimer = () => {
    if (timerId) window.clearInterval(timerId);
    setResendSeconds(120);
    const id = window.setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    setTimerId(id);
  };

  const sendCode = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const data = await apiService.forgotPassword(email);
      setMessage({ type: "success", text: data.message });
      setStep("code");
      startResendTimer();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send reset code" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "email") {
      await sendCode();
    }
  };

  const handleOk = async () => {
    if (!code || code.length < 6) {
      setMessage({ type: "error", text: "Please enter the 6-digit verification code" });
      return;
    }
    
    // Validate the code with the backend before proceeding
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await apiService.validateResetToken(code);
      if (response.valid) {
        // Code is valid, proceed to password reset
        setMessage({ type: "", text: "" });
        setStep("password");
      } else {
        // Code is invalid
        setMessage({ type: "error", text: response.message || "Invalid verification code" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Invalid or expired verification code. Please check your code or request a new one." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!code || code.length < 6) {
      setMessage({ type: "error", text: "Invalid or missing verification code" });
      return;
    }
    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields" });
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
      const data = await apiService.resetPassword(code, newPassword);
      setMessage({ type: "success", text: "Password reset successfully! You can now log in with your new password." });
      setNewPassword("");
      setConfirmPassword("");
      setStep("email");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reset password" });
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
          <p className="mt-3 max-w-md text-sm text-white/90">Forgot your password? No worries, we'll help you reset it.</p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h1 className="text-xl font-semibold">Forgot Password</h1>
          <p className="mt-1 text-sm text-gray-600">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "code" && "We sent a verification code to your email"}
            {step === "password" && "Enter your new password"}
          </p>
          
          {message.text && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {step === "email" && (
              <>
                <div>
                  <label className="block text-sm text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/20"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:translate-y-px disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </>
            )}

            {step === "code" && (
              <>
                <div>
                  <label className="block text-sm text-gray-700">Enter Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/20"
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleOk}
                    disabled={!code || code.length < 6}
                    className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:translate-y-px disabled:opacity-60"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={loading || resendSeconds > 0}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend Code"}
                  </button>
                </div>
              </>
            )}

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
                  onClick={handleChangePassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:translate-y-px disabled:opacity-60"
                >
                  {loading ? "Resetting..." : "Change Password"}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password? <a href="/login" className="font-medium text-gray-900 hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

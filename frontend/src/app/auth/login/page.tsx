"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorToken: "",
  });
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/v1/auth/login", formData);
      const { token, refreshToken, user } = response.data.data;

      // Store tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "student") {
        router.push("/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("2FA")
      ) {
        setShow2FA(true);
        setError("Please enter your 2FA code");
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue your CPA journey
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {show2FA && (
            <div>
              <label
                htmlFor="login-2fa"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                2FA Code
              </label>
              <input
                id="login-2fa"
                name="twoFactorToken"
                type="text"
                required
                maxLength={6}
                value={formData.twoFactorToken}
                onChange={(e) =>
                  setFormData({ ...formData, twoFactorToken: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-2xl tracking-widest"
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Sign up
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500">
            Test Account: teststudent@agiaccountant.com / TestStudent#2025
          </p>
        </div>
      </Card>
    </div>
  );
}

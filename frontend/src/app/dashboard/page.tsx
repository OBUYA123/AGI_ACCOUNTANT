"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Progress {
  totalLessons: number;
  completedLessons: number;
  quizScores: number[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data.data);

        // Fetch progress data
        // TODO: Implement progress endpoint
        setProgress({
          totalLessons: 150,
          completedLessons: 45,
          quizScores: [85, 92, 78, 88, 95],
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const completionPercentage = progress
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AGI Accountant
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.firstName} {user?.lastName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.clear();
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Continue your CPA journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completionPercentage}%
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                📊
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress?.completedLessons || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                ✅
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Score
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress?.quizScores.length
                    ? Math.round(
                        progress.quizScores.reduce((a, b) => a + b, 0) /
                          progress.quizScores.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                ⭐
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Lessons
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress?.totalLessons || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                📚
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push("/courses")}
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-2">📖</span>
                  <span>Continue Learning</span>
                </Button>
                <Button
                  onClick={() => router.push("/tools")}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-2">🧮</span>
                  <span>Accounting Tools</span>
                </Button>
                <Button
                  onClick={() => router.push("/ai-assistant")}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-2">🤖</span>
                  <span>AI Assistant</span>
                </Button>
                <Button
                  onClick={() => router.push("/profile")}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-2">👤</span>
                  <span>My Profile</span>
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Completed Quiz
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Financial Accounting - 95%
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Lesson Completed
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Chapter 5: Balance Sheets
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Tool Used
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Break-Even Calculator
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

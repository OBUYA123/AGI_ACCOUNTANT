import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            AGI Accountant
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Master CPA with
            <span className="text-primary-600 dark:text-primary-400">
              {" "}
              AI-Powered{" "}
            </span>
            Learning
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Complete CPA preparation course with intelligent accounting tools,
            personalized AI assistant, and comprehensive exam preparation.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="px-8">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Everything You Need to Pass CPA
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Complete CPA Course</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive modules, video lessons, quizzes, and practice exams
              covering all CPA topics.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Finance Assistant</h3>
            <p className="text-gray-600 dark:text-gray-400">
              24/7 AI-powered help for accounting problems, tax questions, and
              CPA concept explanations.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-4xl mb-4">🧮</div>
            <h3 className="text-xl font-semibold mb-2">11 Accounting Tools</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Professional-grade calculators for depreciation, tax, payroll,
              cashflow, and more.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your learning progress, quiz scores, and readiness for the
              CPA exam.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-2">Certification</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Earn certificates upon course completion to showcase your
              achievement.
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Flexible Payment</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pay via M-Pesa or PayPal. Secure, fast, and hassle-free payment
              processing.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-primary-600 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your CPA Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students already learning with our platform.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8">
              Create Free Account
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Smart AGI Accountant Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

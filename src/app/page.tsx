'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiCamera, FiCpu, FiMapPin, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Be the <span className="text-yellow-300">Hero</span> Your
              <br />
              Community Needs
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              AI-powered platform to identify, report, and resolve local issues.
              Snap a photo, let AI categorize it, and track resolution in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/report" className="btn-primary text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold">
                  📸 Report an Issue
                </Link>
              ) : (
                <Link href="/register" className="btn-primary text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold">
                  🚀 Get Started Free
                </Link>
              )}
              <Link href="/issues" className="btn-secondary text-lg px-8 py-4 border-white text-white hover:bg-white/10">
                View Issues Map
              </Link>
            </div>
          </div>
        </div>
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to make your community better
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCamera className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Snap & Report</h3>
              <p className="text-gray-600">
                Take a photo of any community issue. Our AI instantly analyzes
                and categorizes it for you.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCpu className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">
                Gemini AI determines severity, suggests departments, and provides
                resolution recommendations.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Track & Resolve</h3>
              <p className="text-gray-600">
                Community members verify, upvote, and track issues until they
                are resolved. Earn points!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Powered by Google Gemini AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI capabilities that make community management smarter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
              <FiCamera className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Image Recognition</h3>
              <p className="text-gray-600 text-sm">
                Upload a photo and AI automatically identifies the type of issue,
                severity level, and affected area.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
              <FiCpu className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Auto-Categorization</h3>
              <p className="text-gray-600 text-sm">
                Issues are automatically tagged with the right category and
                routed to the appropriate department.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
              <FiTrendingUp className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Predictive Insights</h3>
              <p className="text-gray-600 text-sm">
                AI analyzes patterns to predict upcoming issues and suggest
                preventive measures.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
              <FiMapPin className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Hotspot Detection</h3>
              <p className="text-gray-600 text-sm">
                Identifies areas with recurring problems and suggests focused
                interventions.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
              <FiShield className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Priority Scoring</h3>
              <p className="text-gray-600 text-sm">
                AI assigns priority scores based on severity, community impact,
                and resource availability.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
              <FiUsers className="w-8 h-8 text-teal-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Community Verification</h3>
              <p className="text-gray-600 text-sm">
                Crowd-sourced verification ensures reported issues are legitimate
                and accurately described.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of community heroes who are making their neighborhoods better, one report at a time.
          </p>
          <Link
            href={session ? '/report' : '/register'}
            className="inline-block bg-white text-green-700 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {session ? '📸 Report an Issue Now' : '🦸 Become a Community Hero'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">
                Community<span className="text-green-400">Hero</span>
              </span>
            </div>
            <p className="text-sm">
              Built with ❤️ using Next.js, Google Gemini AI & MongoDB
            </p>
            <p className="text-xs mt-2">
              © 2024 CommunityHero. Empowering communities through technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

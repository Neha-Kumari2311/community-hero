'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { FiMenu, FiX, FiPlus, FiMap, FiBarChart2, FiAward, FiLogOut, FiLogIn } from 'react-icons/fi';

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                Community<span className="text-green-600">Hero</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/issues"
              className="flex items-center space-x-1 text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FiMap className="w-4 h-4" />
              <span>Issues</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FiBarChart2 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FiAward className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>

            {session ? (
              <>
                <Link
                  href="/report"
                  className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Report Issue</span>
                </Link>
                <div className="flex items-center space-x-3 ml-2">
                  <span className="text-sm text-gray-600">
                    Hi, {session.user?.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 text-sm transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/issues"
              className="block px-3 py-2 text-gray-600 hover:text-green-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              📍 Issues
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-gray-600 hover:text-green-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className="block px-3 py-2 text-gray-600 hover:text-green-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              🏆 Leaderboard
            </Link>
            {session ? (
              <>
                <Link
                  href="/report"
                  className="block px-3 py-2 bg-green-600 text-white rounded-md text-center"
                  onClick={() => setIsOpen(false)}
                >
                  ➕ Report Issue
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-3 py-2 text-red-600 rounded-md"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 bg-green-600 text-white rounded-md text-center"
                onClick={() => setIsOpen(false)}
              >
                🔑 Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

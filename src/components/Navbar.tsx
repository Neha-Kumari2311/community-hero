'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiPlus, FiMap, FiBarChart2, FiAward, FiLogOut, FiLogIn, FiMapPin, FiGift, FiHome } from 'react-icons/fi';

function AQIBadge() {
  const [aqiValue, setAqiValue] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=us_aqi&timezone=auto`
            );
            const data = await res.json();
            if (data?.current?.us_aqi) setAqiValue(data.current.us_aqi);
          } catch {}
        },
        () => {
          // Default Delhi
          fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.6139&longitude=77.209&current=us_aqi&timezone=auto')
            .then(r => r.json())
            .then(d => { if (d?.current?.us_aqi) setAqiValue(d.current.us_aqi); })
            .catch(() => {});
        }
      );
    }
  }, []);

  if (aqiValue === null) return null;

  const color = aqiValue <= 50 ? 'bg-green-500' : aqiValue <= 100 ? 'bg-yellow-500' : aqiValue <= 150 ? 'bg-orange-500' : 'bg-red-500';

  const label = aqiValue <= 50 ? 'Good' : aqiValue <= 100 ? 'OK' : aqiValue <= 150 ? 'Bad' : 'Poor';

  return (
    <div className={`${color} text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1`} title={`Air Quality Index: ${aqiValue} (${label})`}>
      <span>🌬️</span>
      <span>AQI {aqiValue}</span>
    </div>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-green-600 bg-green-50 font-semibold'
        : 'text-gray-600 hover:text-green-600'
    }`;

  const mobileLinkClass = (path: string) =>
    `block px-3 py-2 rounded-md ${
      isActive(path)
        ? 'text-green-600 bg-green-50 font-semibold'
        : 'text-gray-600 hover:text-green-600'
    }`;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + AQI */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:inline">
                FixMy<span className="text-green-600">City</span>
              </span>
            </Link>
            <AQIBadge />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className={`flex items-center ${isActive('/') && pathname === '/' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'} px-2 py-2 rounded-md transition-colors`} title="Home">
              <FiHome className="w-5 h-5" />
            </Link>
            <Link href="/issues" className={linkClass('/issues')}>
              <FiMap className="w-4 h-4" />
              <span>Issues</span>
            </Link>
            <Link href="/map" className={linkClass('/map')}>
              <FiMapPin className="w-4 h-4" />
              <span>Map</span>
            </Link>

            {session && (session.user as any)?.role === 'admin' ? (
              <>
                <Link href="/admin/dashboard" className={linkClass('/admin')}>
                  <FiBarChart2 className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
                <Link href="/leaderboard" className={linkClass('/leaderboard')}>
                  <FiAward className="w-4 h-4" />
                  <span>Leaderboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={linkClass('/dashboard')}>
                  <FiBarChart2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/leaderboard" className={linkClass('/leaderboard')}>
                  <FiAward className="w-4 h-4" />
                  <span>Leaderboard</span>
                </Link>
                <Link href="/challenges" className={linkClass('/challenges')}>
                  <FiGift className="w-4 h-4" />
                  <span>Challenges</span>
                </Link>
              </>
            )}

            {session ? (
              <>
                {(session.user as any)?.role === 'admin' ? (
                  <span className="flex items-center space-x-1 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    🛡️ Admin
                  </span>
                ) : (
                  <Link
                    href="/report"
                    className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Report Issue</span>
                  </Link>
                )}
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
            <Link href="/" className={mobileLinkClass('/')} onClick={() => setIsOpen(false)}>
              🏠 Home
            </Link>
            <Link href="/issues" className={mobileLinkClass('/issues')} onClick={() => setIsOpen(false)}>
              📍 Issues
            </Link>
            <Link href="/map" className={mobileLinkClass('/map')} onClick={() => setIsOpen(false)}>
              🗺️ Map View
            </Link>
            <Link href="/dashboard" className={mobileLinkClass('/dashboard')} onClick={() => setIsOpen(false)}>
              📊 Dashboard
            </Link>
            <Link href="/leaderboard" className={mobileLinkClass('/leaderboard')} onClick={() => setIsOpen(false)}>
              🏆 Leaderboard
            </Link>
            <Link href="/challenges" className={mobileLinkClass('/challenges')} onClick={() => setIsOpen(false)}>
              🎯 Challenges
            </Link>
            <Link href="/rewards" className={mobileLinkClass('/rewards')} onClick={() => setIsOpen(false)}>
              🎁 Rewards
            </Link>
            <Link href="/quiz" className={mobileLinkClass('/quiz')} onClick={() => setIsOpen(false)}>
              🧠 Eco Quiz
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

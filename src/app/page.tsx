'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiCamera, FiCpu, FiMapPin, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';

const communityTips = [
  { emoji: '🌳', tip: 'Planting just one tree can absorb up to 22 kg of CO2 per year and provide oxygen for 2 people.', category: 'Environment' },
  { emoji: '🚶', tip: 'Walking or cycling instead of driving for short trips reduces air pollution by up to 75% per trip.', category: 'Transport' },
  { emoji: '💧', tip: 'A single leaking tap wastes up to 20,000 liters of water per year. Report water leaks immediately!', category: 'Water' },
  { emoji: '🗑️', tip: 'Proper waste segregation can reduce landfill waste by 60%. Separate wet and dry waste at home.', category: 'Sanitation' },
  { emoji: '💡', tip: 'Well-lit streets reduce crime by up to 20%. Report broken streetlights to keep your neighborhood safe.', category: 'Safety' },
  { emoji: '🏘️', tip: 'Communities with active citizen participation see 40% faster resolution of civic issues.', category: 'Community' },
  { emoji: '🌍', tip: 'Every plastic bag takes 500 years to decompose. Carry a cloth bag and reduce plastic pollution.', category: 'Environment' },
  { emoji: '🚗', tip: 'Potholes cause over 3,000 road accidents daily in India. Report them to save lives!', category: 'Roads' },
  { emoji: '🌊', tip: 'Blocked drains cause 80% of urban flooding. Clear debris near your drains before monsoon.', category: 'Drainage' },
  { emoji: '🤝', tip: 'A clean neighborhood increases property values by 10-15%. Community cleanliness benefits everyone.', category: 'Community' },
  { emoji: '🌱', tip: 'Composting kitchen waste reduces garbage by 30% and creates free fertilizer for plants.', category: 'Environment' },
  { emoji: '🔊', tip: 'Noise pollution above 70dB causes hearing damage. Report illegal loudspeakers and construction noise.', category: 'Health' },
  { emoji: '🏛️', tip: 'Public parks improve mental health by 30%. Help maintain them by reporting damaged equipment.', category: 'Public Spaces' },
  { emoji: '♻️', tip: 'Recycling one aluminum can saves enough energy to power a TV for 3 hours.', category: 'Recycling' },
  { emoji: '🐦', tip: 'Urban trees are home to 20+ bird species. Protecting trees preserves local biodiversity.', category: 'Biodiversity' },
  { emoji: '🚰', tip: 'Clean drinking water prevents 80% of waterborne diseases. Report contamination immediately.', category: 'Health' },
  { emoji: '🌤️', tip: 'Green spaces reduce urban temperatures by 2-8°C. Support tree planting in your area.', category: 'Climate' },
  { emoji: '📱', tip: 'Technology-enabled civic reporting resolves issues 3x faster than traditional complaint methods.', category: 'Technology' },
  { emoji: '🏗️', tip: 'Illegal construction weakens infrastructure. Report unauthorized building activities to prevent disasters.', category: 'Safety' },
  { emoji: '🐕', tip: 'Stray animal population control through sterilization is humane and effective. Support local drives.', category: 'Animal Welfare' },
  { emoji: '🚌', tip: 'Using public transport reduces your carbon footprint by 65% compared to driving alone.', category: 'Transport' },
  { emoji: '🌙', tip: 'Light pollution affects sleep quality. Properly directed streetlights help both safety and health.', category: 'Health' },
  { emoji: '🧹', tip: 'Participating in community cleanups builds stronger neighborhoods and lasting friendships.', category: 'Community' },
  { emoji: '📋', tip: 'Citizens who actively report issues inspire others — be the change your community needs!', category: 'Motivation' },
  { emoji: '🎯', tip: 'Setting small goals (report 1 issue/week) creates lasting habits of community engagement.', category: 'Motivation' },
  { emoji: '🌈', tip: 'Diverse communities are stronger. Inclusive spaces welcome everyone regardless of background.', category: 'Community' },
  { emoji: '⚡', tip: 'LED streetlights use 75% less energy than traditional ones. Advocate for upgrades in your area.', category: 'Energy' },
  { emoji: '🏥', tip: 'Access to clean air and green spaces reduces hospital visits by 25%. Fight pollution actively.', category: 'Health' },
  { emoji: '📊', tip: 'Data-driven decisions improve city management. Your reports provide valuable data to authorities.', category: 'Technology' },
  { emoji: '🙏', tip: 'Gratitude amplifies impact. Thank community members and authorities when issues get resolved!', category: 'Community' },
];

function AQIWidget() {
  const [aqi, setAqi] = useState<any>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Open-Meteo Air Quality API - completely free, no API key needed
            const res = await fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`
            );
            const data = await res.json();
            if (data?.current) {
              setAqi(data.current);
            }
            // Get location name from reverse geocoding (free)
            try {
              const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=&count=1&latitude=${latitude}&longitude=${longitude}`
              );
              setLocationName(`Lat ${latitude.toFixed(2)}, Lng ${longitude.toFixed(2)}`);
            } catch {
              setLocationName(`Lat ${latitude.toFixed(2)}, Lng ${longitude.toFixed(2)}`);
            }
          } catch (err) {
            setError('Failed to fetch AQI data');
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Default to Delhi if location denied
          fetchAQI(28.6139, 77.209, 'New Delhi (default)');
        }
      );
    } else {
      fetchAQI(28.6139, 77.209, 'New Delhi (default)');
    }
  }, []);

  const fetchAQI = async (lat: number, lng: number, name: string) => {
    try {
      const res = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`
      );
      const data = await res.json();
      if (data?.current) {
        setAqi(data.current);
        setLocationName(name);
      }
    } catch {
      setError('Failed to fetch AQI');
    } finally {
      setLoading(false);
    }
  };

  const getAQILevel = (value: number) => {
    if (value <= 50) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-100', emoji: '😊' };
    if (value <= 100) return { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', emoji: '😐' };
    if (value <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-600', bg: 'bg-orange-100', emoji: '😷' };
    if (value <= 200) return { label: 'Unhealthy', color: 'text-red-600', bg: 'bg-red-100', emoji: '🤢' };
    if (value <= 300) return { label: 'Very Unhealthy', color: 'text-purple-600', bg: 'bg-purple-100', emoji: '⚠️' };
    return { label: 'Hazardous', color: 'text-red-900', bg: 'bg-red-200', emoji: '☠️' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
        <p className="text-gray-400 animate-pulse">📍 Detecting your location for AQI...</p>
      </div>
    );
  }

  if (error || !aqi) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
        <p className="text-gray-500">Unable to load AQI data. Allow location access to see your air quality.</p>
      </div>
    );
  }

  const aqiValue = aqi.us_aqi || 0;
  const level = getAQILevel(aqiValue);

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            🌬️ Air Quality Index (AQI)
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <FiMapPin className="w-3 h-3" /> {locationName} • Live data
          </p>
        </div>
        <div className={`text-4xl`}>{level.emoji}</div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`${level.bg} rounded-2xl p-6 text-center min-w-[120px]`}>
          <div className={`text-4xl font-bold ${level.color}`}>{aqiValue}</div>
          <div className={`text-sm font-medium ${level.color} mt-1`}>{level.label}</div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">PM2.5</div>
            <div className="text-lg font-semibold text-gray-800">{aqi.pm2_5?.toFixed(1) || '--'} µg/m³</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">PM10</div>
            <div className="text-lg font-semibold text-gray-800">{aqi.pm10?.toFixed(1) || '--'} µg/m³</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">NO₂</div>
            <div className="text-lg font-semibold text-gray-800">{aqi.nitrogen_dioxide?.toFixed(1) || '--'} µg/m³</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-xs text-gray-500">Ozone</div>
            <div className="text-lg font-semibold text-gray-800">{aqi.ozone?.toFixed(1) || '--'} µg/m³</div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">Powered by Open-Meteo Air Quality API • Auto-detected location • Updates hourly</p>
    </div>
  );
}

function DailyFactCard() {
  const [fact, setFact] = useState<string>('');
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const localTip = communityTips[dayOfYear % communityTips.length];

  useEffect(() => {
    fetch('https://uselessfacts.jsph.pl/api/v2/facts/today')
      .then(r => r.json())
      .then(d => { if (d?.text) setFact(d.text); })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left border border-white/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🌍</span>
        <span className="text-sm font-semibold text-white">Did You Know?</span>
      </div>
      <p className="text-sm text-green-100 leading-relaxed line-clamp-3">
        {fact || localTip.tip}
      </p>
    </div>
  );
}

function CommunityTipCard() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tip = communityTips[dayOfYear % communityTips.length];

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left border border-white/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{tip.emoji}</span>
        <span className="text-sm font-semibold text-white">💡 Community Tip</span>
        <span className="text-xs px-1.5 py-0.5 bg-white/20 text-green-100 rounded-full">{tip.category}</span>
      </div>
      <p className="text-sm text-green-100 leading-relaxed line-clamp-3">
        {tip.tip}
      </p>
    </div>
  );
}

function DailyTip() {
  const [fact, setFact] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Get a different local tip each day as fallback
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const localTip = communityTips[dayOfYear % communityTips.length];

  useEffect(() => {
    const fetchFact = async () => {
      try {
        // Free API - no key needed
        const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/today');
        const data = await res.json();
        if (data?.text) {
          setFact(data.text);
        }
      } catch (error) {
        // Fallback to local tip
        setFact('');
      } finally {
        setLoading(false);
      }
    };
    fetchFact();
  }, []);

  return (
    <div className="space-y-4">
      {/* API Fact */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">🧠</div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-800">🌍 Did You Know?</h3>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Daily Fact</span>
            </div>
            {loading ? (
              <p className="text-gray-400 animate-pulse">Loading today&apos;s fact...</p>
            ) : (
              <p className="text-gray-700 text-lg leading-relaxed">
                {fact || localTip.tip}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-3">Changes daily • Powered by uselessfacts API</p>
          </div>
        </div>
      </div>

      {/* Local Community Tip */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">{localTip.emoji}</div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-800">💡 Community Tip of the Day</h3>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{localTip.category}</span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{localTip.tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-300">FixMyCity</span> — Your City, Your Voice
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-6 max-w-3xl mx-auto">
              AI-powered platform to identify, report, and resolve local civic issues.
              Snap a photo, let AI categorize it, and track resolution in real-time.
            </p>

            {/* Tips side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
              <DailyFactCard />
              <CommunityTipCard />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/report" className="text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all inline-block">
                  📸 Report an Issue
                </Link>
              ) : (
                <Link href="/register" className="text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all inline-block">
                  🚀 Get Started Free
                </Link>
              )}
              <Link href="/map" className="text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all inline-block">
                🗺️ View Issues Map
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



      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">
                FixMy<span className="text-green-400">City</span>
              </span>
            </div>
            <p className="text-sm">
              Built with ❤️ using Next.js, Google Gemini AI & MongoDB
            </p>
            <p className="text-xs mt-2">
              © 2025 FixMyCity. Empowering citizens through AI-powered civic technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiCamera, FiMapPin, FiCpu, FiSend, FiX, FiUpload, FiVideo } from 'react-icons/fi';

const categories = [
  { value: 'pothole', label: '🕳️ Pothole' },
  { value: 'water_leakage', label: '💧 Water Leakage' },
  { value: 'streetlight', label: '💡 Streetlight' },
  { value: 'waste_management', label: '🗑️ Waste Management' },
  { value: 'road_damage', label: '🛣️ Road Damage' },
  { value: 'drainage', label: '🌊 Drainage' },
  { value: 'public_property', label: '🏛️ Public Property' },
  { value: 'safety_hazard', label: '⚠️ Safety Hazard' },
  { value: 'pollution', label: '🏭 Pollution' },
  { value: 'other', label: '📋 Other' },
];

export default function ReportIssuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    address: '',
    lat: 0,
    lng: 0,
  });

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);

      // Analyze with AI
      setAnalyzing(true);
      try {
        const res = await fetch('/api/issues/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            mimeType: file.type,
          }),
        });

        const data = await res.json();

        if (res.ok && data.analysis) {
          setAiAnalysis(data.analysis);
          // Auto-fill form with AI suggestions
          setFormData((prev) => ({
            ...prev,
            title: data.analysis.suggested_title || prev.title,
            description: data.analysis.description || prev.description,
            category: data.analysis.category || prev.category,
            severity: data.analysis.severity || prev.severity,
          }));
          toast.success('🤖 AI analysis complete!');
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
        toast.error('AI analysis failed. Please fill details manually.');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
          }));
          // Reverse geocode to get address text (free Nominatim API)
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`
            );
            const data = await res.json();
            if (data?.display_name) {
              setFormData((prev) => ({
                ...prev,
                address: prev.address || data.display_name,
              }));
            }
          } catch {
            // Fallback if geocoding fails
            setFormData((prev) => ({
              ...prev,
              address: prev.address || `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            }));
          }
          toast.success('📍 Location captured!');
        },
        (error) => {
          toast.error('Could not get location. Please enter manually.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category || 'other',
          severity: formData.severity,
          images: imagePreview ? [imagePreview] : [],
          location: {
            address: formData.address,
            lat: formData.lat || 28.6139,
            lng: formData.lng || 77.209,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('🎉 Issue reported successfully! +10 points');
        router.push('/issues');
      } else {
        toast.error(data.error || 'Failed to report issue');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Report an Issue</h1>
        <p className="text-gray-600 mt-1">
          Upload a photo and let AI help you categorize the issue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiCamera className="text-green-600" />
            Upload Image (Recommended)
          </h2>

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Click to upload or drag & drop
              </p>
              <p className="text-sm text-gray-400 mt-1">
                PNG, JPG up to 5MB. AI will auto-analyze the image.
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Issue preview"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setAiAnalysis(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <FiX className="w-4 h-4" />
              </button>

              {analyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-medium">🤖 AI Analyzing...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                <FiCpu className="w-4 h-4" />
                AI Analysis Results
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>{' '}
                  <span className="font-medium">{aiAnalysis.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Severity:</span>{' '}
                  <span className={`font-medium badge badge-${aiAnalysis.severity}`}>
                    {aiAnalysis.severity}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Department:</span>{' '}
                  <span className="font-medium">{aiAnalysis.suggested_department}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Impact:</span>{' '}
                  <span className="font-medium">{aiAnalysis.estimated_impact}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Upload Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiVideo className="text-blue-600" />
            Upload Video (Optional)
          </h2>

          {!videoPreview ? (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <FiVideo className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                Click to upload a video
              </p>
              <p className="text-sm text-gray-400 mt-1">
                MP4, WebM up to 50MB. Provide video evidence of the issue.
              </p>
            </div>
          ) : (
            <div className="relative">
              <video
                src={videoPreview}
                controls
                className="w-full h-64 rounded-xl bg-black"
              />
              <button
                type="button"
                onClick={() => {
                  setVideoPreview(null);
                  setVideoFile(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <FiX className="w-4 h-4" />
              </button>
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <FiVideo className="w-3 h-3" />
                {videoFile?.name} ({(videoFile?.size ? videoFile.size / (1024 * 1024) : 0).toFixed(1)}MB)
              </div>
            </div>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 50 * 1024 * 1024) {
                toast.error('Video must be less than 50MB');
                return;
              }
              setVideoFile(file);
              setVideoPreview(URL.createObjectURL(file));
              toast.success('🎬 Video attached!');
            }}
            className="hidden"
          />
        </div>

        {/* Issue Details */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Issue Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Brief title for the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                className="input-field min-h-[120px]"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  className="input-field"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiMapPin className="text-red-500" />
            Location
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter the address or landmark"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <FiMapPin className="w-4 h-4" />
              📍 Use my current location
            </button>

            {formData.lat !== 0 && (
              <p className="text-xs text-green-600 font-medium">
                ✅ Location captured successfully
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <FiSend className="w-5 h-5" />
              Submit Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}

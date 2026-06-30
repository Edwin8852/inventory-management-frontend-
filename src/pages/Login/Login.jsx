import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Eye, EyeOff, PackageSearch, Loader2, LogIn, UserPlus, PackageCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your network and credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* Left Panel - Illustration & Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-900 via-teal-800 to-indigo-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle background glow/patterns could go here */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        
        {/* Illustration */}
        <div className="relative z-10 w-full max-w-lg mb-12 transform hover:scale-105 transition-transform duration-700 ease-in-out">
          <img src="/garment-illustration.png" alt="Garment Manufacturing Supply Chain" className="w-full drop-shadow-2xl rounded-xl object-contain mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
        </div>

        {/* Branding text */}
        <div className="relative z-10 w-full max-w-lg text-left self-center mt-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
              <PackageCheck className="text-white w-8 h-8 transform -rotate-3" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">End-to-End <br/> Garments ERP</h1>
            </div>
          </div>
          <p className="text-teal-100 text-xl font-medium tracking-wide">Optimize Your Inventory & Billing.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Top Branding (Mobile / Form Header) */}
          <div className="p-8 pb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <PackageSearch className="text-white w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">XTown Gobal PVT LMT</h2>
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Garments Inventory & Billing</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-4 text-indigo-700 border-b-2 border-indigo-600 text-sm font-bold">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <Link to="/register" className="flex-1 flex items-center justify-center gap-2 py-4 text-gray-400 hover:text-indigo-600 text-sm font-semibold transition-colors">
              <UserPlus className="w-4 h-4" /> Create Account
            </Link>
          </div>

          {/* Form Body */}
          <div className="p-8 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Sign in to your account</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-xl text-sm text-red-600 font-medium flex items-start gap-3">
                <div className="mt-0.5">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-800 font-medium"
                  placeholder="supplier@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-800 font-medium"
                    placeholder="••••••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot Password?</a>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-medium">Or sign in with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-bold text-gray-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-bold text-gray-700">
                  <ShieldCheck className="w-5 h-5 text-gray-600" />
                  Corporate SSO
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 font-medium">
                © {new Date().getFullYear()} Garments ERP Solutions. <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a> | <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;

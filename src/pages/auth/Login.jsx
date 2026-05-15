import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated, isLoading, error: storeError } = useAuthStore();

  const from = location.state?.from?.pathname || "/dashboard";

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    // Attempt login
    const success = await loginUser({ email, password, rememberMe });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-deep flex flex-col items-center justify-center p-4 selection:bg-primary/30">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8 z-10 group">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-deep font-display font-bold text-2xl group-hover:shadow-glow transition-all duration-300">U</div>
        <span className="font-display font-bold text-3xl tracking-tight text-text-1">Uni<span className="text-primary">Clubs</span></span>
      </Link>

      <Card className="w-full max-w-md z-10 animate-slide-up border-border-glow/50 bg-surface/80 backdrop-blur-xl">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {(localError || storeError) && (
              <div className="bg-danger/10 border border-danger/30 rounded-md p-3 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger/90 leading-tight">
                  {localError || storeError}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email or Student ID"
                type="text"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <div className="flex justify-end">
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary-dim transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border-glow bg-deep text-primary focus:ring-primary focus:ring-offset-deep"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none text-text-2 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              className="w-full shadow-glow py-3 mt-2"
              isLoading={isLoading}
            >
              {!isLoading && <LogIn className="w-4 h-4 mr-2" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dim transition-colors">
              Sign up here
            </Link>
          </div>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-border-glow space-y-3">
            <p className="text-xs text-text-2 text-center font-medium uppercase tracking-wider">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setEmail('student@uni.edu'); setPassword('demo'); }}
                className="px-3 py-2 text-xs font-medium rounded-btn bg-surface-2 text-text-2 hover:text-text-1 hover:bg-primary/10 border border-border-glow hover:border-primary/40 transition-all"
              >
                👤 Student
              </button>
              <button
                type="button"
                onClick={() => { setEmail('officer@uni.edu'); setPassword('demo'); }}
                className="px-3 py-2 text-xs font-medium rounded-btn bg-surface-2 text-text-2 hover:text-text-1 hover:bg-secondary/10 border border-border-glow hover:border-secondary/40 transition-all"
              >
                🏢 Officer
              </button>
              <button
                type="button"
                onClick={async () => { 
                  setEmail('admin@uni.edu'); 
                  setPassword('demo');
                  const success = await loginUser({ email: 'admin@uni.edu', password: 'demo' });
                  if (success) navigate('/admin', { replace: true });
                }}
                className="px-3 py-2 text-xs font-medium rounded-btn bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer text */}
      <p className="text-text-2/60 text-xs mt-8 text-center z-10">
        By logging in, you agree to your University's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default Login;

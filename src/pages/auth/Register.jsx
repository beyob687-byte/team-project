import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, isLoading, error: storeError } = useAuthStore();

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

    if (!name || !email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    // Attempt register (we will mock this in authStore)
    if (register) {
      const success = await register({ name, email, password });
      if (success) {
        navigate(from, { replace: true });
      }
    } else {
       setLocalError('Registration is not fully hooked up to the store yet!');
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
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Join your university's club network
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
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />

              <Input
                label="University Email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full shadow-glow py-3 mt-2"
              isLoading={isLoading}
            >
              {!isLoading && <UserPlus className="w-4 h-4 mr-2" />}
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-2">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dim transition-colors">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer text */}
      <p className="text-text-2/60 text-xs mt-8 text-center z-10">
        By registering, you agree to your University's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default Register;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI } from '../api/auth';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth }           = useAuthStore();
  const navigate              = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginAPI(form);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);

      // Redirect based on role
      if (data.user.role === 'organizer') navigate('/organizer');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background pt-20">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <span className="text-background font-bold text-2xl leading-none">E</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome Back</h1>
          <p className="text-secondary mt-2 font-medium">Enter your credentials to continue</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input bg-[#18181b]/50"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input bg-[#18181b]/50"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <p className="text-center text-secondary text-sm mt-8 relative z-10">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline decoration-primary/50 underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../api/auth';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'user' });
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
      const { data } = await registerAPI(form);
      setAuth(data.user, data.token);
      toast.success('Account created successfully!');
      if (data.user.role === 'organizer') navigate('/organizer');
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background pt-24 pb-12">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <span className="text-background font-bold text-2xl leading-none">E</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create Account</h1>
          <p className="text-secondary mt-2 font-medium">Join us and experience more</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="input bg-[#18181b]/50"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder="Min. 6 characters"
                className="input bg-[#18181b]/50"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">I am a...</label>
              <div className="relative">
                <select
                  name="role"
                  className="input bg-[#18181b]/50 appearance-none pr-10 cursor-pointer"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="user" className="bg-background">Ticket Buyer</option>
                  <option value="organizer" className="bg-background">Event Organizer</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          <p className="text-center text-secondary text-sm mt-8 relative z-10">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline decoration-primary/50 underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
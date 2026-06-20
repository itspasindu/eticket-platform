import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="fixed w-full top-0 z-50 glass-panel border-b-0 border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <span className="text-background font-bold text-lg leading-none">E</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">
            Ticket<span className="text-secondary font-light">.</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
            Experiences
          </Link>
          {isAuthenticated && user?.role === 'organizer' && (
            <Link to="/organizer" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              My Events
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-secondary hover:text-primary transition-colors flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center border border-secondary/20">
                  <span className="text-xs">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <span>{user?.name || 'Dashboard'}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-secondary hover:text-white transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                Log In
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
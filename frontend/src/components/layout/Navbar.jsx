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
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎟️</span>
          <span className="text-xl font-bold text-white">
            E<span className="text-primary">Ticket</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            Events
          </Link>
          {isAuthenticated && user?.role === 'organizer' && (
            <Link to="/organizer" className="text-gray-400 hover:text-white transition-colors">
              My Events
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">
              Admin
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                👤 {user?.name || 'My Tickets'}
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
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
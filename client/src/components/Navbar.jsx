import { useAuth } from '../context/AuthContext';
import { LogOut, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Zap size={22} strokeWidth={2.5} />
          <span>TaskSphere</span>
        </div>

        <div className="navbar-right">
          <div className="user-pill">
            <div className="user-avatar" aria-label={`User: ${user?.name}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar-img" referrerPolicy="no-referrer" />
              ) : (
                initials
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>

          <button
            className="btn-icon logout-btn"
            onClick={handleLogout}
            id="logout-button"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <style>{`
        .navbar {
          background: rgba(10, 10, 15, 0.85);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(24px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 800;
          color: var(--accent-light);
          letter-spacing: -0.3px;
        }
        .navbar-brand svg { color: var(--accent); }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px 6px 6px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 40px;
        }
        .user-avatar {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, var(--accent), #7c3aed);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          overflow: hidden;
        }
        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .user-email {
          font-size: 11px;
          color: var(--text-muted);
        }
        .logout-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: all var(--transition);
        }
        .logout-btn:hover {
          background: var(--danger-light);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--danger);
        }
        @media (max-width: 480px) {
          .user-info { display: none; }
          .user-pill { padding: 4px; }
        }
      `}</style>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/',          icon: '📊', label: 'Dashboard'  },
  { path: '/inventory', icon: '📦', label: 'Inventory'  },
  { path: '/billing',   icon: '🧾', label: 'Billing'    },
  { path: '/sales',     icon: '📋', label: 'Sales'      },
  { path: '/dues',      icon: '💰', label: 'Due List'   },
  { path: '/reports',   icon: '📈', label: 'Reports'    },
  { path: '/customers', icon: '👥', label: 'Customers'  },
  { path: '/settings',  icon: '⚙️', label: 'Settings'   },
];

const Navbar = ({ dueCount = 0 }) => {
  const { logout, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  /* Close automatically on navigation */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* Close on Escape */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__brand">
          {settings.shopLogo
            ? <img src={settings.shopLogo} alt="logo" className="navbar__logo-img" />
            : <span className="navbar__logo-emoji">🙏</span>}
          <div className="navbar__brand-text">
            <div className="navbar__shop-name">{settings.shopName}</div>
            <div className="navbar__tagline">Inventory &amp; Billing System</div>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="navbar__links">
          {NAV_ITEMS.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              <span>{icon}</span>
              <span className="navbar__link-label">{label}</span>
              {path === '/dues' && dueCount > 0 && (
                <span className="navbar__badge">{dueCount}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="navbar__right">
          <button className="navbar__logout" onClick={handleLogout} title="Logout">🚪</button>
          <button
            className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay Menu */}
      {menuOpen && (
        <div className="navbar__overlay" onClick={() => setMenuOpen(false)}>
          <div className="navbar__drawer" onClick={(e) => e.stopPropagation()}>
            <div className="navbar__drawer-header">
              <div className="navbar__drawer-brand">
                {settings.shopLogo
                  ? <img src={settings.shopLogo} alt="logo" className="navbar__drawer-logo" />
                  : <span className="navbar__drawer-emoji">🙏</span>}
                <div>
                  <div className="navbar__drawer-shop">{settings.shopName}</div>
                  <div className="navbar__drawer-user">{user?.name ? `👤 ${user.name}` : 'Shop Admin'}</div>
                </div>
              </div>
              <button className="navbar__drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="navbar__drawer-links">
              {NAV_ITEMS.map(({ path, icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `navbar__drawer-link${isActive ? ' navbar__drawer-link--active' : ''}`
                  }
                >
                  <span className="navbar__drawer-icon">{icon}</span>
                  <span className="navbar__drawer-text">{label}</span>
                  {path === '/dues' && dueCount > 0 && (
                    <span className="navbar__drawer-badge">{dueCount} due</span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="navbar__drawer-footer">
              <button className="navbar__drawer-logout" onClick={handleLogout}>
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

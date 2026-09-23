import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/inventory', label: 'Inventory' },
  { path: '/billing', label: 'Billing' },
  { path: '/sales', label: 'Sales' },
  { path: '/dues', label: 'Due List' },
  { path: '/reports', label: 'Reports' },
  { path: '/customers', label: 'Customers' },
  { path: '/settings', label: 'Settings' },
];

const Navbar = ({ dueCount = 0 }) => {
  const { user, logout } = useAuth();
  const { settings, isSettingsVerified, openSettingsModal, resetSettingsVerification } = useSettings();
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

  const handleNavClick = (path, e) => {
    if (path === '/settings' && !isSettingsVerified) {
      e.preventDefault();
      openSettingsModal(() => {
        navigate('/settings');
      });
    }
  };

  const handleDrawerNavClick = (path, e) => {
    setMenuOpen(false);
    if (path === '/settings' && !isSettingsVerified) {
      e.preventDefault();
      openSettingsModal(() => {
        navigate('/settings');
      });
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    if (resetSettingsVerification) resetSettingsVerification();
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__brand">
          {settings.shopLogo
            ? <img src={settings.shopLogo} alt="logo" className="navbar__logo-img" />
            : <span className="navbar__logo-mark">GB</span>}
          <div className="navbar__brand-text">
            <div className="navbar__shop-name">{settings.shopName}</div>
            <div className="navbar__tagline">Inventory &amp; Billing System</div>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="navbar__links">
          {NAV_ITEMS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={(e) => handleNavClick(path, e)}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              <span className="navbar__link-label">{label}</span>
              {path === '/dues' && dueCount > 0 && (
                <span className="navbar__badge">{dueCount}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="navbar__right">
          <button className="navbar__logout" onClick={handleLogout} title="Logout">Logout</button>
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
                  : <span className="navbar__drawer-mark">GB</span>}
                <div>
                  <div className="navbar__drawer-shop">{settings.shopName}</div>
                  <div className="navbar__drawer-user">{user?.name || 'Shop Admin'}</div>
                </div>
              </div>
              <button className="navbar__drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="navbar__drawer-links">
              {NAV_ITEMS.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  onClick={(e) => handleDrawerNavClick(path, e)}
                  className={({ isActive }) =>
                    `navbar__drawer-link${isActive ? ' navbar__drawer-link--active' : ''}`
                  }
                >
                  <span className="navbar__drawer-text">{label}</span>
                  {path === '/dues' && dueCount > 0 && (
                    <span className="navbar__drawer-badge">{dueCount} due</span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="navbar__drawer-footer">
              <button className="navbar__drawer-logout" onClick={handleLogout}>
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

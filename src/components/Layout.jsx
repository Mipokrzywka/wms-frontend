import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, FileText, LayoutDashboard, Menu, X } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh' 
    }}>
      
      <aside style={{ 
        width: isMobile ? '100%' : '260px', 
        borderRight: isMobile ? 'none' : '1px solid var(--border)', 
        borderBottom: isMobile ? '1px solid var(--border)' : 'none',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        justifyContent: isMobile ? 'space-between' : 'flex-start',
        alignItems: isMobile ? 'center' : 'stretch',
        gap: '20px',
        backgroundColor: 'var(--bg)',
        position: isMobile ? 'sticky' : 'relative',
        top: 0,
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>WMS Panel</h2>
        
        {isMobile && (
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}

        <nav style={{ 
          display: (!isMobile || menuOpen) ? 'flex' : 'none', 
          flexDirection: isMobile ? 'column' : 'column', 
          gap: '8px',
          position: isMobile ? 'absolute' : 'static',
          top: isMobile ? '100%' : 'auto',
          left: 0,
          width: isMobile ? '100%' : 'auto',
          backgroundColor: 'var(--bg)',
          padding: isMobile ? '20px' : '0',
          borderBottom: isMobile ? '1px solid var(--border)' : 'none',
          boxSizing: 'border-box'
        }}>
          <Link to="/" onClick={() => setMenuOpen(false)} style={menuStyle(location.pathname === '/')}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} style={menuStyle(location.pathname === '/products')}>
            <Package size={18} /> Produkty
          </Link>
          <Link to="/reports" onClick={() => setMenuOpen(false)} style={menuStyle(location.pathname === '/reports')}>
            <FileText size={18} /> Raporty
          </Link>
        </nav>
      </aside>

      <main style={{ 
        flex: 1, 
        padding: isMobile ? '20px' : '32px', 
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <Outlet />
      </main>

    </div>
  );
};

const menuStyle = (isActive) => ({
  color: isActive ? 'var(--accent)' : 'var(--text)',
  backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
  textDecoration: 'none',
  padding: '12px 14px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '15px',
  fontWeight: isActive ? '500' : '400',
  transition: 'all 0.2s ease'
});

export default Layout;
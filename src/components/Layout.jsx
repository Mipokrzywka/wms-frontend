import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, FileText, LayoutDashboard, Menu, X, ListOrdered, User, Shield, LogOut } from 'lucide-react';

const Layout = () => {
  const { permissions, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />
    },
    {
      path: '/users',
      label: 'Users',
      icon: <User size={18}/>,
      requiredPermission: 'Users:Read'
    },
    {
      path: '/roles',
      label: 'Roles',
      icon: <Shield size={18}/>,
      requiredPermission: 'Roles:Read'
    },
    {
      path: '/products',
      label: 'Products',
      icon: <Package size={18} />,
      requiredPermission: 'Products:Read'
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: <ListOrdered size={18}/>,
      requiredPermission: 'Orders:Read'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <FileText size={18} />,
      requiredPermission: 'Reports:Read'
    },  
  ];

  const allowedMenuItems = menuItems.filter(item => 
    permissions.includes(item.requiredPermission) || permissions.includes('Access:All')
  );

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
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      <aside style={{ 
        width: isMobile ? '100%' : '260px', 
        borderRight: isMobile ? 'none' : '1px solid var(--border)', 
        borderBottom: isMobile ? '1px solid var(--border)' : 'none',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isMobile ? 'space-between' : 'flex-start',
        alignItems: isMobile ? 'center' : 'stretch',
        gap: '20px',
        backgroundColor: 'var(--bg)',
        position: isMobile ? 'sticky' : 'relative',
        top: 0,
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        <div style = {{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}> 
          <h2>WMS Panel</h2>
          
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}
        </div>

        <nav style={{ display: (!isMobile || menuOpen) ? 'flex' : 'none', flexDirection: 'column', gap: '8px', alignItems: 'stretch', width: '100%' }}>
          {allowedMenuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={() => setMenuOpen(false)} 
              style={menuStyle(location.pathname === item.path)}
            >
              {item.icon} {item.label}
            </Link>
          ))}

          <button onClick={logout} style={{ ...menuStyle(false), color: 'var(--red)', cursor: 'pointer', background: 'none', border: '1px solid', marginTop: 'auto' }}>
            <LogOut size={18} />
            Log Out
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: isMobile ? '20px' : '32px', overflowY: 'auto', boxSizing: 'border-box' }}>
        <Outlet />
      </main>
    </div>
  );
};

const menuStyle = (isActive) => ({
  color: isActive ? 'var(--accent)' : 'var(--text)',
  backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent', // Zmienione z '1px solid' na transparent dla czystszego wyglądu, gdy nieaktywne
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
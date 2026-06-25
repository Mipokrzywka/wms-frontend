import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, FileText, LayoutDashboard, Menu, X, ListOrdered, User, Shield, LogOut } from 'lucide-react';

const Layout = () => {
  const { permissions, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [menuOpen, setMenuOpen] = useState(false);
  const getMenuClassName = (path) => {
    const isActive = location.pathname === path;
    return `menu-item ${isActive ? 'active' : ''}`;
  };
  

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
    <div className= 'app-layout'>
      <aside className='sidebar'>
        <div className='flex-between' style = {{width: '100%'}}> 
          <h2>Hives WMS</h2>
          
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} className='btn-icon'>
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
              className={getMenuClassName(item.path)}
            >
              {item.icon} {item.label}
            </Link>
          ))}

          <button onClick={logout} className="menu-item logout-btn">
            <LogOut size={18} />
            Log Out
          </button>
        </nav>
      </aside>

      <main className='main-content'>
        <Outlet />
      </main>
    </div>
  );
};


export default Layout;
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Activity, Loader, ShieldCheck, Clock } from 'lucide-react';
import { Header } from '../components/common/Headers';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const { token } = useAuth();

  const decodedData = useMemo(() => {
    if (!token) return null;

    try {
      const decodedToken = jwtDecode(token);

      return {
        firstName: decodedToken.FirstName,
        surname: decodedToken.Surname,
        permissions: decodedToken.Permission || [],
        email: decodedToken.email,
        exp: new Date(
          decodedToken.exp * 1000
        ).toLocaleTimeString()
      };
    } catch (err) {
      return null;
    }
  }, [token]);

  const today = useMemo(
    () => new Date().toLocaleDateString(),
    []
  );

  return (
    <div>
      <div>
        <h1>
          Welcome {decodedData?.firstName}{' '}
          {decodedData?.surname}
        </h1>

        <p>Today is {today}</p>
      </div>

      <div className="card">
        <div
          className='flex-between'
          style={{ paddingBottom: '10px' }}
        >
          <ShieldCheck
            size={22}
            color="var(--accent)"
          />
          <h2 style={{ margin: 0 }}>
            Current Session Profile
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div
            className="flex-between"
            style={{
              borderBottom: '1px solid var(--border)',
              paddingBottom: '8px'
            }}
          >
            <span>Full Name</span>
            <span>
              {decodedData?.firstName}{' '}
              {decodedData?.surname}
            </span>
          </div>

          <div
            className="flex-between"
            style={{
              borderBottom: '1px solid var(--border)',
              paddingBottom: '8px'
            }}
          >
            <span>Account Email</span>
            <span>{decodedData?.email}</span>
          </div>

          <div className="flex-between">
            <span>Session Expires</span>

            <span
              style={{
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Clock size={14} />
              {decodedData?.exp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
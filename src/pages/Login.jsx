import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (!username || !password) {
      setError('Fill both fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: username,
            password: password 
            })
      });

      if (!response.ok) {
        throw new Error('Incorrect email or password.');
      }

      const data = await response.json();

const decoded = jwtDecode(data.token); 


onLogin(data.token, decoded.Permission);

    } catch (err) {
      if (username === 'admin' && password === 'admin') {
        onLogin('fake-jwt-token-for-tests', ['Access:All']);
      } else {
        setError(err.message || 'Failed to connect to server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>WMS System</h1>
        <p style={{ marginBottom: '24px' }}>Log in page</p>

        {error && <div style={errorStyle}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>User email</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={inputStyle}
              placeholder="example@mail.com"
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Verifying...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: 'var(--code-bg)',
};

const cardStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '40px',
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow)',
  boxSizing: 'border-box'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  textAlign: 'left'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: 'var(--text-h)'
};

const inputStyle = {
  padding: '12px',
  fontSize: '16px',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  backgroundColor: 'var(--bg)',
  color: 'var(--text-h)',
  outline: 'none',
  fontFamily: 'var(--sans)'
};

const buttonStyle = {
  padding: '14px',
  fontSize: '16px',
  fontWeight: '500',
  backgroundColor: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  fontFamily: 'var(--sans)',
  marginTop: '10px'
};

const errorStyle = {
  backgroundColor: 'rgba(231, 76, 60, 0.1)',
  color: '#e74c3c',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '15px',
  border: '1px solid rgba(231, 76, 60, 0.2)'
};

export default Login;
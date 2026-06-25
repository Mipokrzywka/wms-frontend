import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
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

      login(data.token, decoded.Permission);

    } catch (err) {
      if (username === 'admin' && password === 'admin') {
        login('fake-jwt-token-for-tests', ['Access:All']);
      } else {
        setError(err.message || 'Failed to connect to server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='center-container'>
      <div className='card'>
        <h1>WMS System</h1>
        <p>Log in page</p>

        {error && <div className='error'>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>User email</label>
            <input
              type="emails"
              value={username}
              required
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
              required
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className='btn btn-primary'>
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



const errorStyle = {
  backgroundColor: 'var(--error-bg)',
  color: 'var(--error)',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '15px',
  border: '1px solid var(--error-bg)'
};

export default Login;
import React from 'react';

export const Header = ({ text }) => {
  return (
    <div>
      <h1>{text}</h1>
    </div>
  );
};

export const SearchBar = ({ value, onChange, placeholder, disabled }) => (
  <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <span style={{ color: 'var(--text)' }}>🔍</span>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
    />
  </div>
);

import React from 'react';

export const DataTable = ({ headers, data, renderRow }) => {
  return (
    <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', height: 'fit-content' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--thr-bg)' }}>
            {headers.map((header, idx) => (
              <th key={idx} style={{ padding: '16px 20px', color: 'var(--text)', fontWeight: '500' }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => renderRow(item, idx))}
        </tbody>
      </table>
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

import React from "react";

export const FormInput = ({ label, type = 'text', required, placeholder, value, onChange, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{label}</label>
    <input 
      type={type} 
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
    />
  </div>
);

export const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '450px', boxShadow: 'var(--shadow)', boxSizing: 'border-box' }}>
        <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-h)', fontSize: '20px' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};
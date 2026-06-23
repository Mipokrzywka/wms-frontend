import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, Loader, Trash2, Pencil } from 'lucide-react';

const Users = () => {
  const { token, permissions } = useAuth();
  const canManageUsers = Array.isArray(permissions) && (permissions.includes('Users:Manage') || permissions.includes('Access:All'));
  

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({email: '', password: '', firstName: '', surname: '', roleIds: [] });
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const fetchUsers = async () => {  
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users (Status: ${response.status})`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.log('API not responding');
    } finally {
      setLoading(false);
    }
  };
  const handleSaveUser = async (e) => {
  e.preventDefault();

  const cleanRoleIds = (Array.isArray(formData?.roleIds) ? formData.roleIds : [])
  .map(id => Number(id))
  .filter(id => !isNaN(id));
  
  const isFormVaild = isEditing 
  ? (formData.firstName || formData.surname || cleanRoleIds.length > 0) 
  : (formData.firstName || formData.surname || cleanRoleIds.length > 0 || formData.email)

  if (!isFormVaild) {
    alert('Fill all fields.');
    return;
  }
  try {
    setFormSubmitLoading(true);
    
    let response;

    if (isEditing)
    {
      response = await fetch(`/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          surname: formData.surname,
          roleIds: cleanRoleIds         
        })
      });
    } else{    
      response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          surname: formData.surname,
          email: formData.email,
          roleIds: cleanRoleIds,
        })
      });
    }

    if (!response.ok){
      const errMsg = await response.text();
      throw new Error(errMsg || 'Failed to save the user.');
    } 

    if (isEditing){
      const updatedRoleNames = roles.filter(r => cleanRoleIds.includes(r.roleId)).map(r => r.name);

      setUsers(users.map(u => u.id === editingUserId 
        ? { 
            ...u, 
            firstName: formData.firstName, 
            surname: formData.surname, 
            roles: updatedRoleNames 
          } 
        : u
      ));
    }
    else{
      const responseText = await response.text();
      
      try {
        const newUserFromServer = JSON.parse(responseText);
        setUsers([...users, newUserFromServer]);
      } catch (e) {
        const updatedRoleNames = roles.filter(r => cleanRoleIds.includes(r.id)).map(r => r.name);
        const temporaryNewUser = {
          id: Date.now(),
          firstName: formData.firstName,
          surname: formData.surname,
          email: formData.email,
          roles: updatedRoleNames
        };
        setUsers([...users, temporaryNewUser]);
      }
    }
    setFormData({email: '', firstName: '', surname: '', roleIds: []})    
    setIsModalOpen(false);
    setEditingUserId(null);

  } catch (err) {
    console.error(`Operation failure ${err}`);
    alert(err.message);  
  } finally {
    setFormSubmitLoading(false);
  }
};

  const fetchRoleNames = async () =>{
    try{
      setError(null);

      const response = await fetch('/api/roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch roles (Status: ${response.status})`);
      }

      const data = await response.json();
      setRoles(data);
    } catch (err) {
      console.log(`API failure ${err}`);      
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Do you want to delete the user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`User deletion failure. status: ${response.status}`);

      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };
  const handleEditClick = (user) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    
    const userRoleIds = (roles || [])
    .filter(r => user.roles?.includes(r.name || r.Name))
    .map(r => r.id ?? r.Id ?? r.roleId)
    .filter(id => id !== undefined && id !== null)
    .map(id => Number(id));

    setFormData({
      firstName: user.firstName || '',
      surname: user.surname || '',
      email: user.email || '',
      roleIds: userRoleIds
    });
  
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoleNames();
    }
  }, [token]);


  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles?.join().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '600', margin: '0 0 6px 0', color: 'var(--text-h)' }}>User management panel</h1>
        </div>
        {canManageUsers && (
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditingUserId(null);
              setFormData({ email: '', password: '', firstName: '', surname: '', roleIds: [] });
              setIsModalOpen(true);
            }} 
            style={{ backgroundColor: 'var(--accent-bg)', color: 'white', border: 'none', borderRadius: '6px', padding: '12px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          >
            <UserPlus size={18} /> Add user
          </button>
        )}        
      </div>

      <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--text)" />
        <input 
          type="text" 
          placeholder="Search by name, surname, email or role" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading || error}
          style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-h)', fontSize: '14px', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '12px', color: 'var(--accent)' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text)' }}>Pobieranie listy użytkowników...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600' }}>{error}</p>
          <button onClick={fetchUsers} style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Spróbuj ponownie</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', height: 'fit-content' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--thr-bg)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text)', fontWeight: '500' }}>User</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text)', fontWeight: '500' }}>Roles</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '2px', color: 'var(--text-h)' }}>{user.firstName} {user.surname}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text)' }}>{user.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{fontSize: '12px', fontWeight: '500' }}>
                          {user.roles && user.roles.join(', ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>                        
                          {canManageUsers && (
                            <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
                            <button 
                            onClick={() => handleEditClick(user)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '4px' }}
                            title="Edit user"
                          >
                            <Pencil size={16} />
                          </button>                          
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                            </div>
                          )}
                          
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          
{isModalOpen && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '450px', boxShadow: 'var(--shadow)', boxSizing: 'border-box' }}>
      
      <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-h)', fontSize: '20px' }}>{isEditing ? 'Edit user' : 'Add user'}</h2>
      
      <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>First name</label>
          <input 
            type="text" 
            required
            placeholder="ex. John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Surname</label>
          <input 
            type="text" 
            required
            placeholder="ex. Smith"
            value={formData.surname}
            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>Adres E-mail</label>
          <input 
            type="email" 
            required
            placeholder="ex. j.smith@hives.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isEditing}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
  <label style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>
    Roles
  </label>
  
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px', 
    maxHeight: '150px', 
    overflowY: 'auto', 
    backgroundColor: 'var(--code-bg)', 
    border: '1px solid var(--border)', 
    borderRadius: '6px', 
    padding: '12px' 
  }}>
    {roles && roles.map((role) => {
      const actualRoleId = role.id ?? role.Id ?? role.roleId ?? index;
      const isChecked = (formData?.roleIds || []).includes(actualRoleId);

      return (
        <label key={role.roleId} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-h)' }}>
          <input 
            type="checkbox"
            checked={isChecked}
            onChange={() => {
              const safeRoleIds = Array.isArray(formData?.roleIds) ? formData.roleIds : [];
              if (isChecked) {
                setFormData({
                  ...formData,
                  roleIds: safeRoleIds.filter(id => id !== actualRoleId)
                });
              } else {
                setFormData({
                  ...formData,
                  roleIds: [...safeRoleIds, actualRoleId]
                });
              }
            }}
            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
          />
          {role.name}
        </label>
      );
    })}
  </div>
</div>
        

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button 
            type="button" 
            onClick={() => setIsModalOpen(false)}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={formSubmitLoading}
            style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            {formSubmitLoading ? 'Saving...' : 'Save user'}
          </button>
        </div>

      </form>
    </div>
  </div>
)}
        </div>
      )}
    </div>
  );
};

export default Users;
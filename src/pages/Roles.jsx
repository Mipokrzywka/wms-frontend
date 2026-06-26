import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldPlus, Search, Trash2, Pencil } from 'lucide-react';

const Roles = () => {
  const { token, permissions } = useAuth();

  const canManageRoles =
    Array.isArray(permissions) &&
    (permissions.includes('Roles:Manage') ||
      permissions.includes('Access:All'));

  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    permissionIds: []
  });



  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/Roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok)
        throw new Error(`Failed to fetch roles (Status: ${response.status})`);
      const data = await response.json();
      setRoles(data);
    }
    catch (err) {
      alert('API not responding');
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailablePermissions(data);
      }
    }
    catch (err) {
      alert('Failed to load system permissions dictionary', err);
    }
  };

    useEffect(() => {
    if (token) {
      fetchRoles();
      fetchPermissions();
    }
  }, [token]);

  const handleSaveRole = async (e) => {
    e.preventDefault();

    const cleanPermIds = (Array.isArray(formData?.permissionIds) ? formData.permissionIds : [])
      .map(id => Number(id))
      .filter(id => !isNaN(id));

    if (!formData.name.trim()) {
      alert('Role name is required.');
      return;
    }

    try {
      const url = isEditing ? `/api/roles/${editingRoleId}` : '/api/roles';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          permissionIds: cleanPermIds
        })
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to save the role.');
      }

      await fetchRoles();

      setIsModalOpen(false);
      setEditingRoleId(null);
      setFormData({ name: '', permissionIds: [] });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Do you really want to delete this role?')) return;

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Role deletion failure, response: ${errorText}`);
      }
      await fetchRoles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (role) => {
    setIsEditing(true);
    setEditingRoleId(role.roleId);

    const currentPermIds = (role.permissions)
      .map(p => p.id)
      .filter(id => id !== undefined && id !== null)
      .map(id => Number(id));

    setFormData({
      name: role.name,
      permissionIds: currentPermIds
    });

    setIsModalOpen(true);
  };

  const filteredRoles = roles.filter(role => {
    const roleName = (role.name || '').toLowerCase();
    const permsString = Array.isArray(role.permissions)
      ? role.permissions.map(p => p.name || p).join(' ').toLowerCase()
      : '';

    return roleName.includes(searchTerm.toLowerCase()) || permsString.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '30px' }}>
        <div>
          <h2>System Roles</h2>
        </div>
        {canManageRoles && (
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingRoleId(null);
              setFormData({ name: '', permissionIds: [] });
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <ShieldPlus size={18} /> Add Role
          </button>
        )}
      </div>

      <div className="input-wrapper" style={{ marginBottom: '10px' }}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by role name or assigned permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>



      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Security Group</th>
              <th>Assigned Permissions</th>
              <th>Users Count</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => (
              <tr key={role.roleId}>
                <td>
                  <div>
                    {role.name}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {
                      role.permissions.map((p, idx) => (
                        <span key={idx} className='input-wrapper'>
                          {p.name || p}
                        </span>
                      ))
                    }
                  </div>
                </td>
                <td>
                  <div>
                    {role.usersCount}
                  </div>
                </td>
                <td>
                  {canManageRoles && (
                    <div className='flex-end-gap'>
                      <button onClick={() => handleEditClick(role)} className="btn-icon btn-icon-primary" title="Edit schema">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteRole(role.roleId)} className="btn-icon btn-icon-delete" title="Purge role">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className='modal-overlay'>
          <div className="card" style={{ width: '450px', padding: '32px' }}>

            <h2 style={{ margin: '0 0 24px 0' }}>{isEditing ? 'Edit Role' : 'Create Role'}</h2>

            <form onSubmit={handleSaveRole}>

              <div className="form-group">
                <label className="form-label">Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    required
                    placeholder="ex. Administrator"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Permissions</label>
                <div className='checkbox-wrapper'>
                  {availablePermissions.map((perm) => {
                    const actualPermId = perm.id ?? perm.permId;
                    const isChecked = (formData?.permissionIds || []).includes(actualPermId);

                    return (
                      <label key={actualPermId} className='checkbox-label'>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const safeIds = Array.isArray(formData?.permissionIds) ? formData.permissionIds : [];
                            setFormData({
                              ...formData,
                              permissionIds: isChecked
                                ? safeIds.filter(id => id !== actualPermId)
                                : [...safeIds, actualPermId]
                            });
                          }}
                          className='checkbox-item'
                        />
                        {perm.name || perm.claimValue}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className='flex-end-gap'>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-cancel">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary">
                  Save role
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
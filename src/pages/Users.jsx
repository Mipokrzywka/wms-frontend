import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, Trash2, Pencil } from 'lucide-react';
import { Header } from '../components/common/Headers';

const Users = () => {
  const { token, permissions } = useAuth();
  const canManageUsers =
    Array.isArray(permissions) &&
    (permissions.includes('Users:Manage') ||
      permissions.includes('Access:All'));

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    surname: '',
    roleIds: []
  });

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
    }
  }, [token]);
  const fetchUsers = async () => {
    try {
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
    }
    catch (err) {
      alert('API not responding');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    const cleanRoleIds = (
      Array.isArray(formData?.roleIds) ? formData.roleIds : [])
      .map(id => Number(id))
      .filter(id => !isNaN(id));

    const isFormVaild = isEditing
      ? (
        formData.firstName &&
        formData.surname &&
        cleanRoleIds.length > 0
      )
      : (
        formData.firstName &&
        formData.surname &&
        cleanRoleIds.length > 0 &&
        formData.email
      );

    if (!isFormVaild) {
      alert('Fill all fields.');
      return;
    }

    try {
      const url = isEditing ? `/api/users/${editingUserId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing
        ? {
          firstName: formData.firstName,
          surname: formData.surname,
          roleIds: cleanRoleIds
        }
        : {
          firstName: formData.firstName,
          surname: formData.surname,
          email: formData.email,
          roleIds: cleanRoleIds,
        }


      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to save the user.');
      }

      await fetchUsers();

      setIsModalOpen(false);
      setEditingUserId(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        surname: '',
        roleIds: []
      })
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchRoles = async () => {
    try {

      const response = await fetch('/api/roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch roles (Status: ${response.status})`
        );
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

      if (!response.ok)  throw new Error(`User deletion failure. status: ${response.status}`);

      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setEditingUserId(user.id);

    const userRoleIds = (roles || [])
      .filter(r => user.roles?.includes(r.name))
      .map(r => r.roleId)
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


  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles?.join().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className='flex-between' style={{ marginBottom: '30px' }}>
        <h2>User management</h2>

        {canManageUsers && (
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingUserId(null);
              setFormData({
                email: '',
                password: '',
                firstName: '',
                surname: '',
                roleIds: []
              });
              setIsModalOpen(true);
            }}
            className='btn btn-primary'
          >
            <UserPlus size={18} /> Add user
          </button>
        )}
      </div>

      <div
        className='input-wrapper'
        style={{ marginBottom: '10px' }}
      >
        <Search size={18} />
        <input
          type='text'
          placeholder='Search by name, surname, email or role'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <div className='table-wrapper'>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                return (
                  <tr key={user.id}>
                    <td>
                      <div>
                        {user.firstName} {user.surname}
                      </div>
                      <div>{user.email}</div>
                    </td>

                    <td>
                      <span>
                        {user.roles && user.roles.join(', ')}
                      </span>
                    </td>

                    <td>
                      {canManageUsers && (
                        <div className='flex-end-gap'>
                          <button
                            onClick={() => handleEditClick(user)}
                            className='btn-icon btn-icon-primary'
                            title='Edit user'
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className='btn-icon btn-icon-delete'
                            title='Delete user'
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
          <div className='modal-overlay'>
            <div
              className='card'
              style={{ width: '450px', padding: '32px' }}
            >
              <h2 style={{ margin: '0 0 24px 0' }}>
                {isEditing ? 'Edit user' : 'Add user'}
              </h2>

              <form onSubmit={handleSaveUser}>
                <div className='form-group'>
                  <label className='form-label'>First name</label>

                  <div className='input-wrapper'>
                    <input
                      type='text'
                      required
                      placeholder='ex. John'
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label'>Surname</label>

                  <div className='input-wrapper'>
                    <input
                      type='text'
                      required
                      placeholder='ex. Smith'
                      value={formData.surname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          surname: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label'>
                    Adres E-mail
                  </label>

                  <div className='input-wrapper'>
                    <input
                      type='email'
                      required
                      placeholder='ex. j.smith@hives.com'
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value
                        })
                      }
                      disabled={isEditing}
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label'>
                    Roles
                  </label>

                  <div className='checkbox-wrapper'>
                    {roles &&
                      roles.map((role) => {
                        const actualRoleId =
                          role.id ??
                          role.Id ??
                          role.roleId ??
                          index;

                        const isChecked = (
                          formData?.roleIds || []
                        ).includes(actualRoleId);

                        return (
                          <label
                            key={role.roleId}
                            className='checkbox-label'
                          >
                            <input
                              type='checkbox'
                              checked={isChecked}
                              onChange={() => {
                                const safeRoleIds =
                                  Array.isArray(
                                    formData?.roleIds
                                  )
                                    ? formData.roleIds
                                    : [];

                                if (isChecked) {
                                  setFormData({
                                    ...formData,
                                    roleIds:
                                      safeRoleIds.filter(
                                        (id) =>
                                          id !== actualRoleId
                                      )
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    roleIds: [
                                      ...safeRoleIds,
                                      actualRoleId
                                    ]
                                  });
                                }
                              }}
                              className='checkbox-item'
                            />
                            {role.name}
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className='flex-end-gap'>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='btn btn-cancel'
                  >
                    Cancel
                  </button>

                  <button
                    type='submit'
                    className='btn btn-primary'
                  >Save user
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
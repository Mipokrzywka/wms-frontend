import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Search, TagPlus, Pencil, Trash2 } from "lucide-react";
const ProductCategories = () => {
    const { token, permissions } = useAuth();

    const canManageCategories =
        Array.isArray(permissions) &&
        (permissions.includes('ProductCategories:Manage') ||
            permissions.includes('Access:All'));

    const [categories, setCategories] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: ''
    });

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/ProductCategories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok)
                throw new Error(`Failed to fetch product categories (Status: ${response.status})`);
            const data = await response.json();
            setCategories(data);
        }
        catch (err) {
            alert('API not responding');
        }
    };

    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token]);
    
    const handleSaveCategory = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Product category is required');
            return;
        }

        try {
            const url = isEditing ? `/api/productcategories/${editingCategoryId}` : '/api/productcategories';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name.trim()
                })
            });

            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(errMsg || 'Failed to save the product category.');
            }

            await fetchCategories();
            setIsModalOpen(false);
            setEditingCategoryId(null);
            setFormData({ name: '' });
        }
        catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Do you really want to delete this category?')) return;

        try {
            const response = await fetch(`/api/productcategories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }

            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Role deletion failure, response: ${errorText}`);
            }
            await fetchCategories();
        }
        catch (err) {
            alert(err.message);
        }
    };

    const handleEditClick = (category) => {
        setIsEditing(true);
        setEditingCategoryId(category.id)
        setFormData({
            name: category.name
        });

        setIsModalOpen(true);
    };

    const filteredCategories = categories.filter(category => category.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (<div>
        <div className="flex-between" style={{ marginBottom: '30px' }}>
            <div>
                <h2>Product Categories</h2>
            </div>
            {canManageCategories && (
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setEditingCategoryId(null);
                        setFormData({ name: '' });
                        setIsModalOpen(true);
                    }}
                    className="btn btn-primary"
                >
                    <TagPlus size={18} /> Add category
                </button>
            )}
        </div>
        <div className="input-wrapper" style={{ marginBottom: '10px' }}>
            <Search size={18} />
            <input
                type="text"
                placeholder="Search by category name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Product Count</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.map((category) => (
                        <tr key={category.id}>
                            <td>
                                <div>
                                    {category.name}
                                </div>
                            </td>
                            <td>
                                <div>
                                    {category.productCount}
                                </div>
                            </td>
                            <td>
                                {canManageCategories && (
                                    <div className='flex-end-gap'>
                                        <button onClick={() => handleEditClick(category)} className="btn-icon btn-icon-primary" title="Edit category">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(category.id)} className="btn-icon btn-icon-delete" title="Delete category">
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
            <div className="modal-overlay">
                <div className="card" style={{ width: '450px', padding: '32px' }}>
                    <h2 style={{ margin: '0 0 24px 0' }}>{isEditing ? 'Edit Category' : 'Create Category'}</h2>

                    <form onSubmit={handleSaveCategory}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    required
                                    placeholder="ex. Electronics"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
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
                                Save category
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

    </div>);
}
export default ProductCategories;
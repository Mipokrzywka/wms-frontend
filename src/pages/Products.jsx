import { useState, useEffect } from 'react';
import QrScanner from '../components/QrScanner';
import { useAuth } from "../context/AuthContext";
import { Search, PackagePlus, Pencil, Trash2, ScanBarcode } from "lucide-react";

const Products = () => {
    const { token, permissions } = useAuth();

    const canManageProducts =
        Array.isArray(permissions) &&
        (permissions.includes('Products:Manage') ||
            permissions.includes('Access:All'));

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedResult, setScannedResult] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        costAmt: '',
        categoryId: '',
        brandId: ''
    });
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok)
                throw new Error(`Failed to fetch products (Status: ${response.status})`);
            const data = await response.json();
            setProducts(data);
        }
        catch (err) {
            alert('API not responding');
        }
    }
    const fetchProductCategories = async () => {
        try {
            const response = await fetch('/api/productcategories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok)
                throw new Error(`Failed to fetch product categories (Status: ${response.status})`);
            const data = await response.json();
            setCategories(data);
        }
        catch (err) {
            alert('API not responding');
        }
    }

    const fetchBrands = async () => {
        try {
            const response = await fetch('/api/brands', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok)
                throw new Error(`Failed to fetch brands (Status: ${response.status})`);
            const data = await response.json();
            setBrands(data);
        }
        catch (err) {
            alert('API not responding');
        }
    }

    useEffect(() => {
        if (token) {
            fetchProducts();
            fetchBrands();
            fetchProductCategories();
        }
    }, [token]);

    const handleSaveProduct = async (e) => {
        e.preventDefault();

        const cleanBrandId = Number(formData.brandId);
        const cleanCategoryId = Number(formData.categoryId);
        const cleanCostAmt = Number(String(formData.costAmt).replace(',', '.'));
        const cleanQuantity = Number(formData.quantity);

        const isFormVaild = (
            formData.name &&
            formData.costAmt &&
            formData.quantity &&
            formData.brandId &&
            formData.categoryId
        );

        if (!isFormVaild) {
            alert('Fill all fields.');
            return;
        }

        try {
            const url = isEditing ? `/api/products/${editingProductId}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST'
            const body = {
                name: formData.name,
                quantity: cleanQuantity,
                costAmt: cleanCostAmt,
                categoryId: cleanCategoryId,
                brandId: cleanBrandId
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
                throw new Error(errMsg || 'Failed to save the product.');
            }

            await fetchProducts();

            setIsModalOpen(false);
            setEditingProductId(null);
            setFormData({
                name: '',
                quantity: '',
                costAmt: '',
                categoryId: '',
                brandId: ''
            })
        } catch (err) {
            alert(err.message);
        }
    }

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Do you really want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Product deletion failure, response: ${errorText}`);
            }
            await fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    }

    const handleEditClick = (product) => {
        setIsEditing(true);
        setEditingProductId(product.id);

        setFormData({
            name: product.name,
            quantity: product.quantity,
            costAmt: product.costAmt,
            categoryId: product.categoryId,
            brandId: product.brandId
        });

        setIsModalOpen(true);
    }


    const handleQrScan = async (qrCodeText) => {
        setScannedResult(qrCodeText);
        setIsScannerOpen(false);

        try {
            const response = await fetch('/api/products/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ qrCode: qrCodeText })
            });

            if (!response.ok) {
                throw new Error('Nie udało się przetworzyć kodu QR.');
            }

            alert(`Sukces! Zeskanowano produkt o kodzie: ${qrCodeText}`);
            fetchProducts()
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (<div>
        <div className='flex-between' style={{ marginBottom: '30px' }}>
            <h2>Products management</h2>
            <div className='flex-end-gap'>
                {canManageProducts && (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setEditingProductId(null);
                            setFormData({
                                name: '',
                                quantity: '',
                                costAmt: '',
                                categoryId: '',
                                brandId: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className='btn btn-primary'
                    >
                        <PackagePlus size={18} /> Add product
                    </button>

                )}
                {canManageProducts && (
                    <button
                        onClick={() => {
                            setIsScannerOpen(true)
                        }}
                        className='btn btn-primary'
                    >
                        <ScanBarcode size={18} /> Scan qr
                    </button>

                )}
            </div>




        </div>
        <div className='input-wrapper'
            style={{ marginBottom: '10px' }}
        >
            <Search size={18} />
            <input
                type='text'
                placeholder='Search by name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

        </div>
        <div>
            <div className='table-wrapper'>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Cost</th>
                            <th>Estimated depletion</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => {
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <span>
                                            {product.name}
                                        </span>
                                    </td>
                                    <td>
                                        {product.brandName}
                                    </td>
                                    <td>
                                        {product.categoryName}
                                    </td>
                                    <td>
                                        {product.quantity}
                                    </td>
                                    <td>
                                        {product.costAmt}
                                    </td>
                                    <td>
                                        {formatDate(product.forecastDepletionDate)}
                                    </td>
                                    <td>
                                        {canManageProducts && (
                                            <div className='flex-end-gap'>
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className='btn-icon btn-icon-primary'
                                                    title='Edit product'
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className='btn-icon btn-icon-delete'
                                                    title='Delete product'
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
        </div>
        {isModalOpen && (
            <div className='modal-overlay'>
                <div
                    className='card'
                    style={{ width: '450px', padding: '32px' }}
                >
                    <h2 style={{ margin: '0 0 24px 0' }}>
                        {isEditing ? 'Edit product' : 'Add product'}
                    </h2>
                    <form onSubmit={handleSaveProduct}>
                        <div className='form-group'>
                            <label className='form-label'>Name</label>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    required
                                    placeholder='ex. HDMI cable'
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value
                                        })
                                    }>
                                </input>
                            </div>
                            <label className='form-label'>Quantity</label>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    required
                                    placeholder='ex. 20'
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quantity: e.target.value
                                        })
                                    }>
                                </input>
                            </div>
                            <label className='form-label'>Cost</label>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    required
                                    placeholder='ex. 10.0'
                                    value={formData.costAmt}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            costAmt: e.target.value
                                        })
                                    }>
                                </input>
                            </div>
                            <label className='form-label'>Category</label>
                            <div className='input-wrapper'>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            categoryId: e.target.value
                                        })
                                    }
                                >
                                    <option>
                                        None
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <label className='form-label'>Brand</label>
                            <div className='input-wrapper'>
                                <select
                                    name="brandId"
                                    value={formData.brandId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            brandId: e.target.value
                                        })
                                    }
                                >
                                    <option>
                                        None
                                    </option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
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
                            >Save product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {isScannerOpen && (
            <div className='modal-overlay'>
                <div
                    className='card'
                    style={{ width: '450px', padding: '32px' }}>
                    <div className='flex-between'>
                        <h3>Open camera</h3>
                        <button
                            onClick={() => setIsScannerOpen(false)}
                            className='btn btn-primary'>
                            Quit
                        </button>
                    </div>
                    <QrScanner onScanSuccess={handleQrScan} />
                </div>
            </div>
        )}
    </div>
    );
};
export default Products;
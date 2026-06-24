import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/common/Headers';

const Roles = () => {
    const {token} = useAuth(); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    
    return <h2>Role management</h2>; }
export default Roles;
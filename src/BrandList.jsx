import React, { useState, useEffect } from 'react';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/brands')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failure in fetching data from API');
        }
        return response.json();
      })
      .then(data => setBrands(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '25px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Test połączenia: React ↔ ASP.NET Core</h2>
      <hr />
      
      {error && <p style={{ color: 'red' }}>Something went wrong: {error}</p>}
      
      {!error && brands.length === 0 && <p>Downloading brands from the database...</p>}

      <ul style={{ lineHeight: '2' }}>
        {brands.map(brand => (
          <li key={brand.id}>
            <strong>ID {brand.id}:</strong> {brand.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrandList;
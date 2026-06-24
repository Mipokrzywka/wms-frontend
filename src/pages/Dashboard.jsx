import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Activity, Loader } from 'lucide-react';
import { Header } from '../components/common/Headers';

const Dashboard = () => {
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Błąd pobierania danych: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
  console.log("API nie odpowiada, ładuję dane testowe");
  setData({
    stats: {
      totalProducts: 1248,
      productsChange: "+12% w tym tygodniu",
      activeOrders: 42,
      ordersChange: "5 oczekuje na spakowanie",
      lowStockCount: 8
    },
    warehouseCapacity: [
      { zoneName: "Strefa A (Palety)", percentage: 84 },
      { zoneName: "Strefa B (Małe gabaryty)", percentage: 39 }
    ],
    recentActivities: [
      { id: 1, type: "Przyjęcie", sku: "SKU-7892", qty: "+50 szt.", user: "M. Borek", time: "10 min temu" },
      { id: 2, type: "Wydanie", sku: "SKU-1102", qty: "-12 szt.", user: "A. Nowak", time: "45 min temu" }
    ]
  });
  // setError(err.message || 'Nie udało się połączyć z serwerem WMS.'); // temporary commented out
} finally {
  setLoading(false);
}
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px', color: 'var(--accent)' }}>
        <Loader size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text)', fontSize: '15px' }}>Wczytywanie wskaźników magazynowych...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)', padding: '24px', borderRadius: '8px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ margin: '0 0 16px 0', fontWeight: '600', fontSize: '16px' }}>⚠️ {error}</p>
        <button onClick={fetchDashboardData} style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          Odśwież pulpit
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Wszystkie Produkty', value: data?.stats?.totalProducts || 0, icon: <Package size={24} color="var(--accent)" />, change: data?.stats?.productsChange || 'Brak danych', changeColor: '#2ecc71' },
    { label: 'Aktywne Zamówienia', value: data?.stats?.activeOrders || 0, icon: <ShoppingCart size={24} color="#a29bfe" />, change: data?.stats?.ordersChange || 'Brak danych', changeColor: '#f1c40f' },
    { label: 'Niski Stan Magazynowy', value: data?.stats?.lowStockCount || 0, icon: <AlertTriangle size={24} color="var(--red)" />, change: 'Wymaga pilnego uzupełnienia', changeColor: 'var(--red)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <Header text={'Main page'}/>
        <p style={{ color: 'var(--text)', margin: 0, fontSize: '14px' }}>Welcome in the Hives WMS system.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {statCards.map((stat, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>{stat.label}</span>
              <div style={{ backgroundColor: 'var(--code-bg)', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                {stat.icon}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-h)' }}>{stat.value}</h2>
              <span style={{ fontSize: '12px', color: stat.changeColor, fontWeight: '500' }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. ZAJĘTOŚĆ MAGAZYNU + OSTATNIE OPERACJE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* LEWA STRONA: ZAJĘTOŚĆ STREF */}
        <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-h)' }}>
            <TrendingUp size={20} color="var(--accent)" /> Zajętość Przestrzeni
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', height: '160px' }}>
            {data?.warehouseCapacity?.map((zone, index) => (
              <div key={index} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span>{zone.zoneName}</span>
                  <span style={{ fontWeight: '600' }}>{zone.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--code-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${zone.percentage}%`, height: '100%', backgroundColor: index % 2 === 0 ? 'var(--accent)' : '#a29bfe', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRAWA STRONA: OSTATNIE OPERACJE */}
        <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-h)' }}>
            <Activity size={20} color="var(--accent)" /> Ostatnie Operacje
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data?.recentActivities?.length === 0 ? (
              <div style={{ padding: '20px', color: 'var(--text)', textAlign: 'center' }}>Brak zarejestrowanych ruchów magazynowych.</div>
            ) : (
              data?.recentActivities?.map((act) => (
                <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--code-bg)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' }}>
                      {act.type}: <span style={{ color: '#a29bfe', fontFamily: 'monospace' }}>{act.sku}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>Pracownik: {act.user}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: act.qty.startsWith('+') ? '#2ecc71' : 'var(--red)' }}>{act.qty}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>{act.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
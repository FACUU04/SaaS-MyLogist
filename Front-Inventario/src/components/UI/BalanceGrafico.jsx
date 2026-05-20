import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BalanceGrafico = ({ data = [] }) => {
  

  // Validación: Si todavía no hay datos, mostramos un estado de carga
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: 350, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Cargando datos del balance...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 13}} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 13}} 
            tickFormatter={(val) => `$${val.toLocaleString("es-AR")}`} 
          />
          <Tooltip 
            formatter={(val) => `$${val.toLocaleString("es-AR")}`} 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '15px' }} />
          
          {/* Los dataKey ahora coinciden exactamente con los nombres de las variables en tu BalanceMensualDTO de Java */}
          <Bar name="Ingresos (Ventas)" dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar name="Egresos (Compras)" dataKey="egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceGrafico;
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "../../styles/UI.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CardVentas = ({ labels, ventasTotales, ventasCantidad }) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Ingresos ($)",
        data: ventasTotales,
        backgroundColor: "#f97316",
        borderRadius: 6,
      },
      {
        label: "Cantidad de Ventas",
        data: ventasCantidad,
        backgroundColor: "#64748b", // Cambié el azul por un tono slate acorde a tu paleta
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // CLAVE PARA RESPONSIVE
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#1e293b", usePointStyle: true, boxWidth: 8 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="chart-card ventas-chart">
      <h3>Estadísticas de Ventas</h3>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CardVentas;
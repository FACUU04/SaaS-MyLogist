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

const Card = ({ title, labels, dataValues, color = "#f97316" }) => {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        backgroundColor: color,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // CLAVE PARA RESPONSIVE
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Card;
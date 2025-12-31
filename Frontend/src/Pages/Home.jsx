import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/home.css";
import {
  checkBMI,
  checkBloodPressure,
  checkHeartRate,
  checkRespiratoryRate,
} from "../Components/customChecks";
import { API_BASE_URL } from "../config/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Home = () => {
  const navigate = useNavigate();
  const [latestVitals, setLatestVitals] = useState(null);
  const [bmiTrend, setBmiTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalRanges = {
    bp: "120/80",
    bmi: "18.5 – 24.9",
    respiratory_rate: "12 – 20 /min",
    heartRate: "60 – 100 bpm",
  };

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reports/dashboard/`, {
      method:"GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched Data:", data);
        setLatestVitals(data.latest_vitals);
        setBmiTrend(data.bmi_trend || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [token]);

  // Fixed chart data - extracting values and dates from bmi_trend array
  const chartData = {
    labels: bmiTrend.map((item) => item.date || "N/A"),
    datasets: [
      {
        label: "BMI History",
        data: bmiTrend.map((item) => item.value),
        fill: true,
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "#16a34a",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `BMI: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          color: '#6b7280'
        },
        title: {
          display: true,
          text: 'BMI Value',
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#6b7280'
        },
        title: {
          display: true,
          text: 'Date',
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="header-title">Health Overview</h1>
          <p className="header-subtitle">Snapshot from your latest medical reports</p>
        </header>

        <div className="action-grid">
          <div className="action-card-upload" onClick={() => navigate("/Upload")}>
            <div className="action-icon">↑</div>
            <h3 className="action-name">Upload Report</h3>
            <p className="action-text">Get an instant AI-powered summary</p>
          </div>

          <div className="action-card-view" onClick={() => navigate("/Reports")}>
            <div className="action-icon">📂</div>
            <h3 className="action-name">View History</h3>
            <p className="action-text">Access your last 12 medical records</p>
          </div>
        </div>

        <div className="vitals-layout">
          <div className="vital-glass-card">
            <h4 className="vital-title">Blood Pressure</h4>
            <div className="vital-main-value">{latestVitals?.bp || "—"}</div>
            <div className="vital-reference">Normal: {normalRanges.bp}</div>
            <span className={checkBloodPressure(latestVitals?.bp)?.badge || "badge-gray"}>
              {checkBloodPressure(latestVitals?.bp)?.label || "No Data"}
            </span>
          </div>

          <div className="vital-glass-card">
            <h4 className="vital-title">Respiratory Rate</h4>
            <div className="vital-main-value">
              {latestVitals?.respiratory_rate ?? "—"} <small>/min</small>
            </div>
            <div className="vital-reference">Normal: {normalRanges.respiratory_rate}</div>
            <span className={checkRespiratoryRate(latestVitals?.respiratory_rate)?.badge || "badge-gray"}>
              {checkRespiratoryRate(latestVitals?.respiratory_rate)?.label || "No Data"}
            </span>
          </div>

          <div className="vital-glass-card">
            <h4 className="vital-title">BMI</h4>
            <div className="vital-main-value">{latestVitals?.bmi ?? "—"}</div>
            <div className="vital-reference">Normal: {normalRanges.bmi}</div>
            <span className={checkBMI(latestVitals?.bmi)?.badge || "badge-gray"}>
              {checkBMI(latestVitals?.bmi)?.label || "No Data"}
            </span>
          </div>

          <div className="vital-glass-card">
            <h4 className="vital-title">Heart Rate</h4>
            <div className="vital-main-value">
              {latestVitals?.heart_rate ?? "—"} <small>bpm</small>
            </div>
            <div className="vital-reference">Normal: {normalRanges.heartRate}</div>
            <span className={checkHeartRate(latestVitals?.heart_rate)?.badge || "badge-gray"}>
              {checkHeartRate(latestVitals?.heart_rate)?.label || "No Data"}
            </span>
          </div>
        </div>

        {bmiTrend.length > 0 && (
          <div className="trend-glass-section">
            <h3 className="trend-main-title">BMI Trend</h3>
            <p className="trend-info">Tracking your progress over {bmiTrend.length} reports</p>
            <div style={{ height: "300px", marginTop: "20px", width: "100%" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
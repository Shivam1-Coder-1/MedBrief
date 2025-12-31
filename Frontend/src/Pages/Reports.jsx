import { useEffect, useState } from "react";
import "../Style/reports.css";
import { API_BASE_URL } from "../config/api";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/reports/history/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        // Backend returns: { success: true, count: 2, reports: [...] }
        if (data.success && Array.isArray(data.reports)) {
          setReports(data.reports);
        } else {
          setReports([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load reports");
        setReports([]);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "normal") return "normal";
    if (statusLower === "critical") return "critical";
    if (statusLower === "attention") return "attention";
    return "unknown";
  };

  const handleShare = async (report) => {
    const url = `${API_BASE_URL}/api/reports/download/${report.id}/`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Medical Report Summary",
          text: `Medical Report: ${report.filename}`,
          url: url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Share failed:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Download link copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
        alert("Failed to copy link");
      }
    }
  };

  return (
    <div className="reports-page-wrapper">
      <div className="reports-history-container">
        <h1 className="reports-main-title">Reports History</h1>
        <p className="reports-subtitle-text">
          View and download your previously analyzed medical reports.
        </p>

        {loading && (
          <div className="reports-loading-state">Loading reports...</div>
        )}

        {error && (
          <div className="reports-error-message">{error}</div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="reports-empty-state">
            No reports uploaded yet. Upload your first medical report to get started!
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="reports-stack-list">
            {reports.map((report) => (
              <div className="report-item-card" key={report.id}>
                <div className="report-item-content">
                  <h3 className="report-item-filename">{report.filename}</h3>
                  <span className="report-item-date">{report.uploaded_at}</span>
                  
                  {report.file_size_kb && (
                    <span className="report-item-size">
                      {report.file_size_kb} KB
                    </span>
                  )}

                  <p className="report-item-summary">
                    {report.final_conclusion || "No summary available"}
                  </p>

                  {(report.bmi || report.respiratory_rate) && (
                    <div className="report-vitals-preview">
                      {report.bmi && (
                        <span className="vital-badge">BMI: {report.bmi}</span>
                      )}
                      {report.respiratory_rate && (
                        <span className="vital-badge">
                          RR: {report.respiratory_rate}/min
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="report-item-actions">
                  <span className={`status-pill-${getStatusColor(report.status)}`}>
                    {report.status || "Unknown"}
                  </span>

                  <div className="report-action-group">
                    {report.has_pdf && report.pdf_url ? (
                      <a
                        href={report.pdf_url}
                        className="btn-download-action"
                        download
                      >
                        Download PDF
                      </a>
                    ) : (
                      <a
                        href={`${API_BASE_URL}/api/reports/download/${report.id}/`}
                        className="btn-download-action"
                        download
                      >
                        Download
                      </a>
                    )}

                    <button
                      className="btn-share-action"
                      onClick={() => handleShare(report)}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
import { useState, useRef } from "react";
import "../Style/reportsummary.css";
import { API_BASE_URL } from "../config/api";

const ReportSummary = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState("");
  const [fileInfo, setFileInfo] = useState(null);

  const xhrRef = useRef(null);
  const fileInputRef = useRef(null);

  const startUpload = (file) => {
    setError("");
    setReportId(null);
    setUploadProgress(0);

    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    });

    const formData = new FormData();
    formData.append("report", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("POST", `${API_BASE_URL}/api/reports/upload/`);

    const token = localStorage.getItem("access_token");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status !== 201) {
          throw new Error(data.error || "Upload failed");
        }
        setReportId(data.report_id);
      } catch {
        setError("Invalid server response");
      } finally {
        setProcessing(false);
      }
    };

    xhr.onerror = () => {
      setError("Upload failed. Please try again.");
      setProcessing(false);
    };

    setProcessing(true);
    xhr.send(formData);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) startUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) startUpload(file);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
      setProcessing(false);
      setUploadProgress(0);
      setFileInfo(null);
      setError("Upload cancelled");
    }
  };

  return (
    <div className="report-summary-page">
      <div className="report-summary-card">
        <h1 className="report-summary-title">Medical Report Summary</h1>
        <p className="report-summary-subtitle">
          Upload your medical report to get a clear, easy-to-read summary.
        </p>

        <div
          className="drop-zone-area"
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p className="drop-zone-text">Drag & drop your report here</p>
          <span className="drop-zone-browse">or click to browse</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="file-input-hidden"
          onChange={handleFileSelect}
        />

        {fileInfo && (
          <div className="file-display-info">
            📄 {fileInfo.name} ({fileInfo.size})
          </div>
        )}

        {processing && (
          <div className="upload-progress-container">
            <div className="upload-progress-track">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="upload-progress-text">
              Uploading… {uploadProgress}%
            </span>

            <button className="btn-cancel-upload" onClick={cancelUpload}>
              Cancel Upload
            </button>
          </div>
        )}

        {error && <div className="upload-error-message">{error}</div>}

        {!processing && reportId && (
          <div className="report-action-buttons">
            <a
              href={`${API_BASE_URL}/api/reports/download/${reportId}/`}
              className="btn-download-pdf"
            >
              Download PDF
            </a>

            <button
              className="btn-share-report"
              onClick={() =>
                navigator.share
                  ? navigator.share({
                      title: "Medical Report Summary",
                      url: `${API_BASE_URL}/api/reports/download/${reportId}/`,
                    })
                  : alert("Sharing not supported")
              }
            >
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSummary;

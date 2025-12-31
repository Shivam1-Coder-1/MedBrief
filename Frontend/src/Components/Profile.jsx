import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "../Style/profile_status.css";

const Profile_Status = () => {
  const [completed, setCompleted] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const checkStatus = async () => {
      if (!token) {
        setCompleted(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/profile/status/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setCompleted(data.profile_completed);
          localStorage.setItem("profile_completed", data.profile_completed);
        } else {
          setCompleted(false);
        }
      } catch (err) {
        setCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [token]);

  if (loading) {
    return (
      <div className="medbrief-status-loading">
        <span className="spinner"></span>
      </div>
    );
  }

  if (completed === null) return null;

  const handleClick = () => {
    navigate(completed ? "/Profile" : "/Profile_create");
  };

  return (
    <button
      onClick={handleClick}
      className={`medbrief-status-btn ${completed ? "is-completed" : "is-incomplete"}`}
      title={completed ? "View Profile" : "Complete Profile"}
    >
      <span className="status-icon">{completed ? "👤" : "⚠️"}</span>
      <span className="status-text">{completed ? "View Profile" : "Complete Profile"}</span>
    </button>
  );
};

export default Profile_Status;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Style/profile_view.css";
import { API_BASE_URL } from "../config/api";

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    bloodgroup: "",
    allergies: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/get/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.success) {
        navigate("/Profile_create");
        return;
      }

      setProfile(data);
      setFormData({ ...data });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/profile/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        setIsEditing(false);
        fetchProfile();
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">

        <h2 className="page-title">Health Profile</h2>

        <div className="profile-identity">
          <div className="avatar-circle">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <h3>{profile.name}</h3>
          <p className="profile-email">{profile.email}</p>
        </div>

        {!isEditing ? (
          <>
            <button className="primary-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>

            <div className="vitals-grid">
              <Vital label="Age" value={`${profile.age} yrs`} />
              <Vital label="Gender" value={profile.gender} />
              <Vital label="Height" value={`${profile.height || "—"} cm`} />
              <Vital label="Weight" value={`${profile.weight || "—"} kg`} />
              <Vital label="Blood Group" value={profile.bloodgroup || "—"} />
            </div>

            <div className="medical-section">
              <h4>Allergies</h4>
              <div className="medical-block">
                {profile.allergies || "None"}
              </div>
            </div>

            <div className="actions">
              <button onClick={() => navigate("/Home")}>Back to Home</button>
              <button onClick={() => navigate("/")}>Logout</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="edit-form">
            <h4>Edit Profile</h4>

            <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Age" name="age" value={formData.age} onChange={handleChange} />
            <Input label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
            <Input label="Height" name="height" value={formData.height} onChange={handleChange} />
            <Input label="Weight" name="weight" value={formData.weight} onChange={handleChange} />
            <Input label="Blood Group" name="bloodgroup" value={formData.bloodgroup} onChange={handleChange} />
            <Textarea label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />

            <div className="actions">
              <button className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Vital = ({ label, value }) => (
  <div className="vital-block">
    <span>{label}</span>
    <p>{value}</p>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="field">
    <label>{label}</label>
    <input {...props} />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="field">
    <label>{label}</label>
    <textarea rows="3" {...props} />
  </div>
);

export default ProfileView;
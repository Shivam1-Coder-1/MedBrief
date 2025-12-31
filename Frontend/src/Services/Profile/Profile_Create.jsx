import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";
import "../../Style/profile_create.css";

const CreateProfile = () => {
    const [profile, setProfile] = useState({
        name: "",
        age: "",
        gender: "",
        weight: "",
        height: "",
        bloodgroup: "",
        allergies: "",
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            toast.error("Session expired. Please login again.");
            navigate("/Login");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/profile/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: profile.name.trim(),
                    age: Number(profile.age),
                    gender: profile.gender,
                    weight: profile.weight ? parseFloat(profile.weight) : null,
                    height: profile.height ? parseFloat(profile.height) : null,
                    bloodgroup: profile.bloodgroup || null,
                    allergies: profile.allergies || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || "Failed to create profile");
            }

            toast.success("Profile created successfully");
            navigate("/Home", { replace: true });

        } catch (err) {
            toast.error(err.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    const skiphandle = async () => {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            toast.error("Session expired. Please login again.");
            navigate("/Login");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/profile/status/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ profile_completed: false }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || "Failed to skip profile");
            }

            toast.info("Profile skipped");
            localStorage.setItem("profile_completed", "false");
            navigate("/Home", { replace: true });
        } catch (err) {
            toast.error(err.message || "Skip failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="medbrief-profile-page">
            <div className="medbrief-profile-card">
                <h2 className="medbrief-profile-title">Create Health Profile</h2>
                <p className="medbrief-profile-subtitle">Provide your details to personalize your health insights.</p>

                <form onSubmit={handleSubmit} className="medbrief-profile-form">
                    <div className="medbrief-input-full">
                        <input name="name" placeholder="Full Name" onChange={handleChange} required />
                    </div>
                    
                    <div className="medbrief-input-half">
                        <input name="age" type="number" placeholder="Age" onChange={handleChange} required />
                    </div>

                    <div className="medbrief-input-half">
                        <select name="gender" onChange={handleChange} required>
                            <option value="">Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="medbrief-input-half">
                        <input name="weight" placeholder="Weight (kg)" onChange={handleChange} />
                    </div>

                    <div className="medbrief-input-half">
                        <input name="height" placeholder="Height (cm)" onChange={handleChange} />
                    </div>

                    <div className="medbrief-input-full">
                        <select name="bloodgroup" onChange={handleChange}>
                            <option value="">Blood Group</option>
                            <option>A+</option><option>A-</option>
                            <option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option>
                            <option>O+</option><option>O-</option>
                        </select>
                    </div>

                    <div className="medbrief-input-full">
                        <textarea name="allergies" placeholder="Known Allergies (Optional)" onChange={handleChange} />
                    </div>

                    <div className="medbrief-form-actions">
                        <button type="submit" className="medbrief-btn-save" disabled={loading}>
                            {loading ? "Saving Profile..." : "Save Profile"}
                        </button>

                        <button type="button" className="medbrief-btn-skip" onClick={skiphandle} disabled={loading}>
                            Skip for now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProfile;
import { useState } from "react";
import "../Style/smarthelp.css";
import { API_BASE_URL } from "../config/api";

const Smart_help = () => {
    const [selected, setSelected] = useState("");
    const [WorkoutLevel, SetWorkoutLevel] = useState("beginner");
    const [BMI, setBMI] = useState("");
    const [DietData, setDietData] = useState(null);
    const [WorkoutData, SetWorkoutData] = useState({});
    const [loading, setLoading] = useState(false);

    const accessToken = localStorage.getItem("access_token");

    const HandleSubmit = async () => {
        if (!selected) return alert("Please select an option first.");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/smart_help/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    know: selected,
                    Workoutlevel: WorkoutLevel,
                    bmi: BMI,
                })
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server crashed and sent an HTML error page.");
            }

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.msg || "An error occurred on the server.");
                return;
            }

            if (data.type === "workout") {
                SetWorkoutData(data);
                setDietData(null);
            } else if (data.type === "diet") {
                setDietData(data.data);
                SetWorkoutData({});
            }

        } catch (err) {
            console.error("Frontend Critical Error:", err);
            alert("Failed to communicate with the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="smart-help-container">
            <div className="background-blob"></div>
            <div className="background-blob blob-2"></div>

            <main className="smart-help-card">
                <header className="sh-header">
                    <h1 className="sh-title">Smart Help</h1>
                    <p className="sh-subtitle">Precision Guidance for your Health & Lifestyle</p>
                </header>

                <div className="sh-toggle-container">
                    <button
                        className={`sh-toggle-btn ${selected === "workout" ? "active" : ""}`}
                        onClick={() => setSelected("workout")}
                    >
                        <span className="icon">💪</span> Workout
                    </button>

                    <button
                        className={`sh-toggle-btn ${selected === "diet" ? "active" : ""}`}
                        onClick={() => setSelected("diet")}
                    >
                        <span className="icon">🥗</span> Diet Plan
                    </button>
                </div>

                <div className="sh-form-wrapper">
                    {selected === "workout" && (
                        <div className="sh-input-group fade-in">
                            <label>Fitness Experience</label>
                            <select className="sh-select" value={WorkoutLevel} onChange={(e) => SetWorkoutLevel(e.target.value)}>
                                <option value="beginner">Beginner (Newbie)</option>
                                <option value="intermediate">Intermediate (Active)</option>
                                <option value="expert">Expert (Pro)</option>
                            </select>
                        </div>
                    )}

                    {selected === "diet" && (
                        <div className="sh-input-group fade-in">
                            <label>Your BMI Index</label>
                            <input
                                className="sh-input"
                                type="number"
                                step="0.1"
                                value={BMI}
                                onChange={(e) => setBMI(e.target.value)}
                                placeholder="e.g. 22.5"
                            />
                        </div>
                    )}

                    <button className={`sh-submit-btn ${loading ? 'loading' : ''}`} onClick={HandleSubmit} disabled={loading}>
                        {loading ? "Generating Plan..." : "Get AI Insights"}
                    </button>
                </div>

           
                <div className="sh-results-container">
                    {WorkoutData?.data && Array.isArray(WorkoutData.data) && (
                        <div className="sh-result-grid fade-up">
                            <h2 className="section-label">Tailored Workout Plan</h2>
                            {WorkoutData.data.slice(0, 5).map((item, index) => (
                                <div className="sh-card anim-delay" key={index} style={{ "--i": index }}>
                                    <div className="card-header">
                                        <h3>{item.name}</h3>
                                        <span className={`badge ${item.difficulty}`}>{item.difficulty}</span>
                                    </div>
                                    <div className="card-body">
                                        <p><b>Target:</b> {item.muscle}</p>
                                        <p className="instr-text">{item.instructions}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {DietData && (
                        <div className="sh-result-grid fade-up">
                            <h2 className="section-label">Nutrition Strategy: {DietData.goal}</h2>
                            <div className="bmi-meter">Current BMI: <span>{DietData.bmi}</span></div>
                            <div className="diet-grid">
                                {DietData.foods.slice(0, 5).map((food, index) => (
                                    <div className="sh-card anim-delay" key={index} style={{ "--i": index }}>
                                        <h4>{food.name}</h4>
                                        <div className="macro-stats">
                                            <span>🔥 {food.calories} cal</span>
                                            <span>🥩 {food.protein_g}g Pro</span>
                                            <span>🍞 {food.carbohydrates_total_g}g Carb</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Smart_help; 

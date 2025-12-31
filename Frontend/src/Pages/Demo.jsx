import { useNavigate } from "react-router-dom";
import "../Style/demo.css";

const HowItWorks = () => {
    const navigate = useNavigate();

    return (
        <div className="how-page">
            <div className="how-container">
                <h1>How It Works</h1>
                <p className="how-subtitle">
                    Understand how our system turns your medical reports into clear health insights.
                </p>

                <div className="steps">
                    
                    <div className="step-card">
                        <span className="step-number">1</span>
                        <h3>Upload Medical Report</h3>
                        <p>
                            Upload your medical report (PDF or image). The system securely stores
                            the file and prepares it for analysis.
                        </p>
                    </div>

                   
                    <div className="step-card">
                        <span className="step-number">2</span>
                        <h3>Text Extraction & Analysis</h3>
                        <p>
                            We extract medical text using OCR and normalize it to detect vitals
                            like blood pressure, sugar, SpO₂, and heart rate.
                        </p>
                    </div>

                   
                    <div className="step-card">
                        <span className="step-number">3</span>
                        <h3>Vitals Comparison</h3>
                        <p>
                            Your vitals are compared against standard medical ranges to identify
                            normal, high, low, or abnormal values.
                        </p>
                    </div>

                    <div className="step-card">
                        <span className="step-number">4</span>
                        <h3>Insights & Summary</h3>
                        <p>
                            The system generates observations and a clear summary to help you
                            understand your health data easily.
                        </p>
                    </div>

                    
                    <div className="step-card">
                        <span className="step-number">5</span>
                        <h3>Dashboard & Trends</h3>
                        <p>
                            View your latest vitals, report history, and trends (like blood sugar)
                            on a simple dashboard.
                        </p>
                    </div>
                </div>

                <div className="how-actions">
                    <button onClick={() => navigate("/Signup")}>
                        Get Started
                    </button>
                    <button className="secondary" onClick={() => navigate("/")}>
                        Go to Dashboard
                    </button>
                </div>

                <p className="disclaimer">
                    ⚠️ This system provides automated insights and is not a replacement
                    for professional medical advice.
                </p>
            </div>
        </div>
    );
};

export default HowItWorks;
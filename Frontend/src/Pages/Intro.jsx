import { NavLink } from "react-router-dom";
import "../Style/intro.css";

const Intro = () => {
    return (
        <div className="medbrief-intro-container">
            <div className="medbrief-blob-bg"></div>
            
            <header className="medbrief-intro-header medbrief-fade-in-down">
                <div className="medbrief-intro-brand">
                    <h2 className="medbrief-intro-logo">Med<span>Brief</span></h2>
                </div>
                <div className="medbrief-intro-nav">
                    <NavLink to="/Login" className="medbrief-primary-btn medbrief-shadow-btn">Login</NavLink>
                </div>
            </header>

            <main className="medbrief-hero-section">
                <div className="medbrief-hero-content medbrief-scale-in">
                    <span className="medbrief-hero-badge">✨ AI-Powered Medical Summaries</span>
                    <h1>Your Health Data, <br /><span className="medbrief-text-gradient">Simplified.</span></h1>
                    <p className="medbrief-hero-subtitle">
                        Transform complex medical reports into clear, actionable insights. 
                        Understand your vitals, track trends, and take control of your wellness 
                        with enterprise-grade AI analysis.
                    </p>

                    <div className="medbrief-cta-group">
                        <NavLink to="/Signup" className="medbrief-primary-btn medbrief-big-btn">Get Started</NavLink>
                        <NavLink to="/Demo" className="medbrief-outline-btn medbrief-big-btn">How it Works</NavLink>
                    </div>
                </div>

                <section className="medbrief-features-container">
                    <div className="medbrief-feature-card medbrief-stagger-1">
                        <div className="medbrief-feature-icon">🔬</div>
                        <h3>Report Decoding</h3>
                        <p>Instantly translate complex medical jargon into plain English you can actually understand.</p>
                    </div>
                    <div className="medbrief-feature-card medbrief-stagger-2">
                        <div className="medbrief-feature-icon">📈</div>
                        <h3>Vital Tracking</h3>
                        <p>Automatically extract and visualize blood pressure, glucose, and SpO2 trends over time.</p>
                    </div>
                    <div className="medbrief-feature-card medbrief-stagger-3">
                        <div className="medbrief-feature-icon">🛡️</div>
                        <h3>Privacy First</h3>
                        <p>Your medical data is encrypted and never shared. You own your health information entirely.</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Intro;
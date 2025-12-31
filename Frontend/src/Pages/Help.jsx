import React from "react";
import '../Style/help.css'

const Help = () => {
    return (
        <div className="help-page-container">
            <header className="help-page-header">
                <h1 className="help-page-title">Need Help?</h1>
                <p className="help-page-subtitle">Your guide to using SmartZen smoothly.</p>
            </header>

            <section className="help-info-card">
                <h2 className="help-card-heading">📄 Uploading Medical Reports</h2>
                <p className="help-card-description">
                    You can upload your medical files in <strong>PDF</strong> or <strong>DOCX</strong> format.
                    Maximum allowed size is <strong>10 MB</strong>.
                </p>
                <ul className="help-card-list">
                    <li className="help-list-item">Go to “Uploads” section</li>
                    <li className="help-list-item">Select your file</li>
                    <li className="help-list-item">Submit & SmartZen will analyze it automatically</li>
                </ul>
            </section>

            <section className="help-info-card">
                <h2 className="help-card-heading">🤖 Using Smart Helper</h2>
                <p className="help-card-description">Ask anything related to your health reports or recommendations.</p>
                <ul className="help-card-list">
                    <li className="help-list-item">Describe symptoms</li>
                    <li className="help-list-item">Ask follow-up questions</li>
                    <li className="help-list-item">Request analysis summaries</li>
                </ul>
            </section>

            <section className="help-info-card">
                <h2 className="help-card-heading">📊 Understanding Dashboard</h2>
                <p className="help-card-description">Your dashboard gives you:</p>
                <ul className="help-card-list">
                    <li className="help-list-item">Recent uploads</li>
                    <li className="help-list-item">AI-generated health insights</li>
                    <li className="help-list-item">History of analyzed reports</li>
                </ul>
            </section>

            <section className="help-info-card">
                <h2 className="help-card-heading">🔐 Privacy & Security</h2>
                <p className="help-card-description">
                    Your data is encrypted and stored securely. SmartZen never shares personal
                    information with third parties.
                </p>
            </section>

            <section className="help-contact-card">
                <h2 className="help-contact-heading">📞 Contact Support</h2>
                <p className="help-contact-text">If you need further help, reach out:</p>
                <div className="help-contact-details">
                    <p>Email: <strong>support@smartzen.ai</strong></p>
                    <p>WhatsApp: <strong>+91 90000 00000</strong></p>
                </div>
            </section>
        </div>
    );
};

export default Help;
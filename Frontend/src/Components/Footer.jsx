import "../Style/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="medbrief-minimal-footer">
      <div className="medbrief-minimal-container">
        <p className="medbrief-footer-text">
          © {currentYear} <span className="medbrief-accent">MedBrief</span>. All rights reserved. 
          <span className="medbrief-footer-separator">•</span> 
          <span className="medbrief-legal-disclaimer">
            AI-generated insights are for informational purposes only and do not constitute medical advice.
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
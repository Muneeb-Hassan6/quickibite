import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.heading}>Oops! Page Not Found</h2>
        <p style={styles.text}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={() => navigate("/")}>
            <FaHome style={{ marginRight: '8px' }} /> Return to Home
          </button>
          <button style={styles.btnSecondary} onClick={() => navigate("/menu")}>
            <FaSearch style={{ marginRight: '8px' }} /> Browse Menu
          </button>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg-body, #0a0a0a)",
    color: "#fff",
    padding: "20px",
    position: "relative",
    overflow: "hidden"
  },
  content: {
    textAlign: "center",
    maxWidth: "600px",
    zIndex: 10,
    background: "rgba(20, 20, 20, 0.6)",
    padding: "50px 30px",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
  },
  errorCode: {
    fontSize: "120px",
    fontWeight: "900",
    margin: "0",
    background: "linear-gradient(135deg, #ef4444 0%, #ff8a00 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: "1",
    textShadow: "0 10px 30px rgba(239, 68, 68, 0.3)"
  },
  heading: {
    fontSize: "32px",
    fontWeight: "700",
    marginTop: "10px",
    marginBottom: "15px",
    color: "#f8fafc"
  },
  text: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "35px",
    lineHeight: "1.6"
  },
  actions: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)"
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  circle1: {
    position: "absolute",
    top: "-10%",
    left: "-5%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(0,0,0,0) 70%)",
    zIndex: 1,
    filter: "blur(40px)"
  },
  circle2: {
    position: "absolute",
    bottom: "-15%",
    right: "-10%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255, 138, 0, 0.1) 0%, rgba(0,0,0,0) 70%)",
    zIndex: 1,
    filter: "blur(50px)"
  }
};

export default NotFoundPage;

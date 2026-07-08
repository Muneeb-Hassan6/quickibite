import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "../styles/Footer.css"; 

const Footer = ({ style }) => {
  const navigate = useNavigate();
  const [footerData, setFooterData] = useState({
    footer_tagline: "Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.",
    footer_facebook: "#",
    footer_twitter: "#",
    footer_instagram: "#",
    footer_youtube: "#",
    footer_phone: "+1 234 567 8900",
    footer_email: "support@bigbite.com"
  });

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
        const result = await response.json();
        if (result.success) {
          setFooterData(prev => ({
            footer_tagline: result.data.footer_tagline || prev.footer_tagline,
            footer_facebook: result.data.footer_facebook || prev.footer_facebook,
            footer_twitter: result.data.footer_twitter || prev.footer_twitter,
            footer_instagram: result.data.footer_instagram || prev.footer_instagram,
            footer_youtube: result.data.footer_youtube || prev.footer_youtube,
            footer_phone: result.data.footer_phone || prev.footer_phone,
            footer_email: result.data.footer_email || prev.footer_email,
          }));
        }
      } catch (error) {
        console.error("Failed to load footer settings:", error);
      }
    };
    fetchFooterSettings();
  }, []);

  return (
    <footer className="online-footer" style={style}>
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1: Brand Info */}
            <div className="footer-col brand-col">
              <h2 className="footer-brand-logo">BIG BITE</h2>
              <p className="footer-brand-desc">
                {footerData.footer_tagline}
              </p>
              <div className="footer-socials">
                <a href={footerData.footer_facebook} target="_blank" rel="noreferrer" className="social-icon"><FaFacebookF /></a>
                <a href={footerData.footer_twitter} target="_blank" rel="noreferrer" className="social-icon"><FaTwitter /></a>
                <a href={footerData.footer_instagram} target="_blank" rel="noreferrer" className="social-icon"><FaInstagram /></a>
                <a href={footerData.footer_youtube} target="_blank" rel="noreferrer" className="social-icon"><FaYoutube /></a>
              </div>
            </div>

            {/* Column 2: Information */}
            <div className="footer-col">
              <h4 className="footer-col-title">Information</h4>
              <ul className="footer-links">
                <li><a onClick={() => navigate("/about")} style={{cursor: "pointer"}}>About Us</a></li>
                <li><a onClick={() => navigate("/privacy")} style={{cursor: "pointer"}}>Privacy Policy</a></li>
                <li><a onClick={() => navigate("/terms")} style={{cursor: "pointer"}}>Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Column 3: Food */}
            <div className="footer-col">
              <h4 className="footer-col-title">Food</h4>
              <ul className="footer-links">
                <li><a onClick={() => navigate("/menu")} style={{cursor: "pointer"}}>Explore Menu</a></li>
                <li><a onClick={() => navigate("/deals")} style={{cursor: "pointer"}}>Top Deals</a></li>
                <li><a onClick={() => navigate("/menu")} style={{cursor: "pointer"}}>Best Sellers</a></li>
                <li><a onClick={() => navigate("/track-order")} style={{cursor: "pointer"}}>Track Order</a></li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="footer-col">
              <h4 className="footer-col-title">Contact Us</h4>
              <ul className="footer-contact-info">
                <li>
                  <FaPhoneAlt className="contact-icon" />
                  <span>{footerData.footer_phone}</span>
                </li>
                <li>
                  <FaEnvelope className="contact-icon" />
                  <span>{footerData.footer_email}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-flex">
            <p>© {new Date().getFullYear()} BigBite POS. All Rights Reserved.</p>
            <div className="footer-bottom-links">
              <a onClick={() => navigate("/privacy")} style={{cursor: "pointer"}}>Privacy Policy</a>
              <a onClick={() => navigate("/terms")} style={{cursor: "pointer"}}>Terms of Use</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

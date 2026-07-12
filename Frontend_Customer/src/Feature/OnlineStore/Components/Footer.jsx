import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope, FaChevronDown } from "react-icons/fa";

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

  // Mobile Accordion State
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (window.innerWidth <= 576) {
      setExpandedSection(expandedSection === section ? null : section);
    }
  };

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
    <footer className="bg-[var(--panel-bg)] text-[var(--text-main)] font-['Open_Sans',sans-serif] border-t-2 border-[var(--brand-red)]" style={style}>
      <div className="pt-[2.5rem] pb-[1.875rem] min-[36.062rem]:pt-[3.75rem] min-[36.062rem]:pb-[2.5rem]">
        <div className="max-w-[75rem] mx-auto px-[1.25rem]">
          <div className="grid grid-cols-1 min-[36.062rem]:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-[0.937rem] min-[36.062rem]:gap-[2.5rem]">
            {/* Column 1: Brand Info */}
            <div className="brand-col flex flex-col">
              <h2 className="font-['Oswald',sans-serif] text-[2rem] font-[800] text-[var(--brand-red)] m-[0_0_0.937rem_0] tracking-[1px]">BIG BITE</h2>
              <p className="text-[0.875rem] text-[var(--text-muted)] leading-[1.6] mb-[0.937rem] min-[36.062rem]:mb-[1.563rem] w-full min-[36.062rem]:max-w-[18.75rem]">
                {footerData.footer_tagline}
              </p>
              <div className="flex gap-[0.937rem] mb-[1.25rem] min-[36.062rem]:mb-0">
                <a href={footerData.footer_facebook} target="_blank" rel="noreferrer" className="flex items-center justify-center w-[2.5rem] h-[2.5rem] bg-[var(--home-bg)] text-[var(--text-main)] rounded-full text-[1.125rem] transition-all duration-300 no-underline hover:bg-[var(--brand-red)] hover:text-white hover:-translate-y-[0.188rem]"><FaFacebookF /></a>
                <a href={footerData.footer_twitter} target="_blank" rel="noreferrer" className="flex items-center justify-center w-[2.5rem] h-[2.5rem] bg-[var(--home-bg)] text-[var(--text-main)] rounded-full text-[1.125rem] transition-all duration-300 no-underline hover:bg-[var(--brand-red)] hover:text-white hover:-translate-y-[0.188rem]"><FaTwitter /></a>
                <a href={footerData.footer_instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center w-[2.5rem] h-[2.5rem] bg-[var(--home-bg)] text-[var(--text-main)] rounded-full text-[1.125rem] transition-all duration-300 no-underline hover:bg-[var(--brand-red)] hover:text-white hover:-translate-y-[0.188rem]"><FaInstagram /></a>
                <a href={footerData.footer_youtube} target="_blank" rel="noreferrer" className="flex items-center justify-center w-[2.5rem] h-[2.5rem] bg-[var(--home-bg)] text-[var(--text-main)] rounded-full text-[1.125rem] transition-all duration-300 no-underline hover:bg-[var(--brand-red)] hover:text-white hover:-translate-y-[0.188rem]"><FaYoutube /></a>
              </div>
            </div>

            {/* Column 2: Information */}
            <div className={`flex flex-col group ${expandedSection === 'info' ? 'expanded' : ''}`}>
              <h4 className="flex min-[36.062rem]:block justify-between items-center font-['Oswald',sans-serif] text-[1.25rem] font-[700] text-[var(--text-main)] m-0 min-[36.062rem]:mb-[1.563rem] uppercase tracking-[0.5px] max-[36rem]:p-[0.937rem_0] max-[36rem]:border-b max-[36rem]:border-[var(--border-color)] cursor-pointer min-[36.062rem]:cursor-auto" onClick={() => toggleSection('info')}>
                Information <FaChevronDown className={`block min-[36.062rem]:hidden text-[0.875rem] transition-transform duration-300 ${expandedSection === 'info' ? 'rotate-180' : ''}`} />
              </h4>
              <ul className={`list-none p-0 m-0 max-h-0 min-[36.062rem]:max-h-none overflow-hidden min-[36.062rem]:overflow-visible transition-all duration-400 ease-out pt-0 min-[36.062rem]:pt-0 ${expandedSection === 'info' ? 'max-[36rem]:max-h-[18.75rem] max-[36rem]:pt-[0.937rem] max-[36rem]:pb-[0.937rem]' : ''}`}>
                <li className="mb-[0.937rem]"><a className="text-[var(--text-muted)] no-underline text-[0.875rem] transition-colors duration-300 cursor-pointer hover:text-[var(--brand-red)]" onClick={() => navigate("/about")}>About Us</a></li>
                <li className="mb-[0.937rem]"><a className="text-[var(--text-muted)] no-underline text-[0.875rem] transition-colors duration-300 cursor-pointer hover:text-[var(--brand-red)]" onClick={() => navigate("/privacy")}>Privacy Policy</a></li>
                <li className="mb-[0.937rem]"><a className="text-[var(--text-muted)] no-underline text-[0.875rem] transition-colors duration-300 cursor-pointer hover:text-[var(--brand-red)]" onClick={() => navigate("/terms")}>Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Column 3: Food */}
            <div className={`flex flex-col group ${expandedSection === 'food' ? 'expanded' : ''}`}>
              <h4 className="flex min-[36.062rem]:block justify-between items-center font-['Oswald',sans-serif] text-[1.25rem] font-[700] text-[var(--text-main)] m-0 min-[36.062rem]:mb-[1.563rem] uppercase tracking-[0.5px] max-[36rem]:p-[0.937rem_0] max-[36rem]:border-b max-[36rem]:border-[var(--border-color)] cursor-pointer min-[36.062rem]:cursor-auto" onClick={() => toggleSection('food')}>
                Food <FaChevronDown className={`block min-[36.062rem]:hidden text-[0.875rem] transition-transform duration-300 ${expandedSection === 'food' ? 'rotate-180' : ''}`} />
              </h4>
              <ul className={`list-none p-0 m-0 max-h-0 min-[36.062rem]:max-h-none overflow-hidden min-[36.062rem]:overflow-visible transition-all duration-400 ease-out pt-0 min-[36.062rem]:pt-0 ${expandedSection === 'food' ? 'max-[36rem]:max-h-[18.75rem] max-[36rem]:pt-[0.937rem] max-[36rem]:pb-[0.937rem]' : ''}`}>
                <li className="mb-[0.937rem]"><a className="text-[var(--text-muted)] no-underline text-[0.875rem] transition-colors duration-300 cursor-pointer hover:text-[var(--brand-red)]" onClick={() => navigate("/menu")}>Explore Menu</a></li>
                <li className="mb-[0.937rem]"><a className="text-[var(--text-muted)] no-underline text-[0.875rem] transition-colors duration-300 cursor-pointer hover:text-[var(--brand-red)]" onClick={() => navigate("/deals")}>Top Deals</a></li>
                <li className="mb-[0.937rem]"><a className="text-[var(--text-muted)] no-underline text-[0.875rem] transition-colors duration-300 cursor-pointer hover:text-[var(--brand-red)]" onClick={() => navigate("/menu")}>Best Sellers</a></li>
                <li className="mb-[0.937rem]"><a className="text-[var(--text-muted)] no-underline text-[0.875rem] transition-colors duration-300 cursor-pointer hover:text-[var(--brand-red)]" onClick={() => navigate("/track-order")}>Track Order</a></li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className={`flex flex-col group ${expandedSection === 'contact' ? 'expanded' : ''}`}>
              <h4 className="flex min-[36.062rem]:block justify-between items-center font-['Oswald',sans-serif] text-[1.25rem] font-[700] text-[var(--text-main)] m-0 min-[36.062rem]:mb-[1.563rem] uppercase tracking-[0.5px] max-[36rem]:p-[0.937rem_0] max-[36rem]:border-b max-[36rem]:border-[var(--border-color)] cursor-pointer min-[36.062rem]:cursor-auto" onClick={() => toggleSection('contact')}>
                Contact Us <FaChevronDown className={`block min-[36.062rem]:hidden text-[0.875rem] transition-transform duration-300 ${expandedSection === 'contact' ? 'rotate-180' : ''}`} />
              </h4>
              <ul className={`list-none p-0 min-[36.062rem]:m-[0_0_1.563rem_0] max-h-0 min-[36.062rem]:max-h-none overflow-hidden min-[36.062rem]:overflow-visible transition-all duration-400 ease-out pt-0 min-[36.062rem]:pt-0 ${expandedSection === 'contact' ? 'max-[36rem]:max-h-[18.75rem] max-[36rem]:pt-[0.937rem] max-[36rem]:pb-[0.937rem]' : ''}`}>
                <li className="flex items-center gap-[0.625rem] mb-[0.937rem] text-[var(--text-muted)] text-[0.875rem]">
                  <FaPhoneAlt className="text-[var(--brand-red)] text-[1rem]" />
                  <span>{footerData.footer_phone}</span>
                </li>
                <li className="flex items-center gap-[0.625rem] mb-[0.937rem] text-[var(--text-muted)] text-[0.875rem]">
                  <FaEnvelope className="text-[var(--brand-red)] text-[1rem]" />
                  <span>{footerData.footer_email}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-body)] py-[1.25rem] border-t border-[var(--border-color)]">
        <div className="max-w-[75rem] mx-auto px-[1.25rem]">
          <div className="flex flex-col min-[36.062rem]:flex-row justify-between items-center flex-wrap gap-[0.937rem] text-center min-[36.062rem]:text-left">
            <p className="m-0 text-[var(--text-muted)] text-[0.812rem]">© {new Date().getFullYear()} BigBite POS. All Rights Reserved.</p>
            <div className="flex gap-[1.25rem]">
              <a className="text-[var(--text-muted)] no-underline text-[0.812rem] transition-colors duration-300 hover:text-[var(--brand-red)] cursor-pointer" onClick={() => navigate("/privacy")}>Privacy Policy</a>
              <a className="text-[var(--text-muted)] no-underline text-[0.812rem] transition-colors duration-300 hover:text-[var(--brand-red)] cursor-pointer" onClick={() => navigate("/terms")}>Terms of Use</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

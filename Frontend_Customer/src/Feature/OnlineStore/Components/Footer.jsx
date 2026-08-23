import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaChevronDown,
} from "react-icons/fa";

const Footer = ({ style }) => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (window.innerWidth <= 640) {
      setExpandedSection(expandedSection === section ? null : section);
    }
  };

  // Fetch Footer Settings via React Query
  const { data: footerData } = useQuery({
    queryKey: ["store_settings_footer"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_settings.php`
      );
      const result = await response.json();
      if (result.success) {
        return {
          footer_tagline:
            result.data.footer_tagline ||
            "Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.",
          footer_facebook: result.data.footer_facebook || "#",
          footer_twitter: result.data.footer_twitter || "#",
          footer_instagram: result.data.footer_instagram || "#",
          footer_youtube: result.data.footer_youtube || "#",
          footer_phone: result.data.footer_phone || "+92 300 1234567",
          footer_email: result.data.footer_email || "support@bigbite.com",
        };
      }
      return {
        footer_tagline:
          "Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.",
        footer_facebook: "#",
        footer_twitter: "#",
        footer_instagram: "#",
        footer_youtube: "#",
        footer_phone: "+92 300 1234567",
        footer_email: "support@bigbite.com",
      };
    },
  });

  return (
    <footer
      className="bg-white dark:bg-[#121214] text-gray-900 dark:text-white border-t border-gray-200 dark:border-neutral-800 transition-colors duration-300"
      style={style}
    >
      <div className="pt-8 pb-8 sm:pt-14 sm:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-4">
            <h2 className="font-['Oswald',sans-serif] text-2xl sm:text-3xl font-black text-gray-900 dark:text-white m-0 tracking-wide uppercase">
              BIG<span className="text-amber-500">BITE</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed max-w-sm m-0">
              {footerData?.footer_tagline}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
              <a
                href={footerData?.footer_facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
                aria-label="Facebook"
              >
                <FaFacebookF className="text-xs sm:text-sm" />
              </a>
              <a
                href={footerData?.footer_twitter}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
                aria-label="Twitter"
              >
                <FaTwitter className="text-xs sm:text-sm" />
              </a>
              <a
                href={footerData?.footer_instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xs sm:text-sm" />
              </a>
              <a
                href={footerData?.footer_youtube}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
                aria-label="YouTube"
              >
                <FaYoutube className="text-xs sm:text-sm" />
              </a>
            </div>
          </div>

          {/* Column 2: Information */}
          <div className="flex flex-col">
            <h4
              className="flex justify-between items-center sm:block font-['Oswald',sans-serif] text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 sm:mb-4 cursor-pointer sm:cursor-auto"
              onClick={() => toggleSection("info")}
            >
              Information
              <FaChevronDown
                className={`sm:hidden text-xs text-gray-400 transition-transform duration-300 ${
                  expandedSection === "info" ? "rotate-180" : ""
                }`}
              />
            </h4>
            <ul
              className={`list-none p-0 m-0 space-y-2 max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible transition-all duration-300 ${
                expandedSection === "info" ? "max-h-48 pt-1" : ""
              }`}
            >
              <li>
                <span
                  className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                  onClick={() => navigate("/about")}
                >
                  About Us
                </span>
              </li>
              <li>
                <span
                  className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                  onClick={() => navigate("/privacy")}
                >
                  Privacy Policy
                </span>
              </li>
              <li>
                <span
                  className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                  onClick={() => navigate("/terms")}
                >
                  Terms & Conditions
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Food & Orders */}
          <div className="flex flex-col">
            <h4
              className="flex justify-between items-center sm:block font-['Oswald',sans-serif] text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 sm:mb-4 cursor-pointer sm:cursor-auto"
              onClick={() => toggleSection("food")}
            >
              Our Menu
              <FaChevronDown
                className={`sm:hidden text-xs text-gray-400 transition-transform duration-300 ${
                  expandedSection === "food" ? "rotate-180" : ""
                }`}
              />
            </h4>
            <ul
              className={`list-none p-0 m-0 space-y-2 max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible transition-all duration-300 ${
                expandedSection === "food" ? "max-h-48 pt-1" : ""
              }`}
            >
              <li>
                <span
                  className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                  onClick={() => navigate("/menu")}
                >
                  Explore Menu
                </span>
              </li>
              <li>
                <span
                  className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                  onClick={() => navigate("/deals")}
                >
                  Top Deals
                </span>
              </li>
              <li>
                <span
                  className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                  onClick={() => navigate("/track-order")}
                >
                  Live Order Tracker
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col">
            <h4
              className="flex justify-between items-center sm:block font-['Oswald',sans-serif] text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 sm:mb-4 cursor-pointer sm:cursor-auto"
              onClick={() => toggleSection("contact")}
            >
              Contact Us
              <FaChevronDown
                className={`sm:hidden text-xs text-gray-400 transition-transform duration-300 ${
                  expandedSection === "contact" ? "rotate-180" : ""
                }`}
              />
            </h4>
            <ul
              className={`list-none p-0 m-0 space-y-2.5 max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible transition-all duration-300 ${
                expandedSection === "contact" ? "max-h-48 pt-1" : ""
              }`}
            >
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
                <FaPhoneAlt className="text-amber-500 text-xs flex-shrink-0" />
                <a href={`tel:${footerData?.footer_phone}`} className="text-inherit no-underline hover:text-amber-500">
                  {footerData?.footer_phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
                <FaEnvelope className="text-amber-500 text-xs flex-shrink-0" />
                <a href={`mailto:${footerData?.footer_email}`} className="text-inherit no-underline hover:text-amber-500 truncate">
                  {footerData?.footer_email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-200/80 dark:border-neutral-800/80 py-4 bg-gray-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2.5 text-center sm:text-left">
          <p className="m-0 text-xs text-gray-500 dark:text-neutral-500">
            © {new Date().getFullYear()} BigBite. All Rights Reserved.
          </p>
          <div className="flex gap-4">
            <span
              className="text-xs text-gray-500 dark:text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </span>
            <span
              className="text-xs text-gray-500 dark:text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/terms")}
            >
              Terms of Use
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

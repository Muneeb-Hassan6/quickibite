import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaFileAlt, FaSave, FaShieldAlt, FaFileContract, FaHeart, FaLayerGroup } from "react-icons/fa";
import Swal from "sweetalert2";

const LegalSettings = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("about");

  const [settings, setSettings] = useState({
    // About Us
    about_hero_badge: "",
    about_hero_title: "",
    about_hero_subtitle: "",
    about_journey_title: "",
    about_journey_text: "",
    about_card1_title: "",
    about_card1_desc: "",
    about_card2_title: "",
    about_card2_desc: "",
    about_card3_title: "",
    about_card3_desc: "",
    about_mission_title: "",
    about_mission_text: "",

    // Privacy Policy
    privacy_hero_badge: "",
    privacy_hero_title: "",
    privacy_hero_subtitle: "",
    privacy_overview_title: "",
    privacy_overview_text: "",
    privacy_card1_title: "",
    privacy_card1_desc: "",
    privacy_card2_title: "",
    privacy_card2_desc: "",
    privacy_card3_title: "",
    privacy_card3_desc: "",
    privacy_guarantee_title: "",
    privacy_guarantee_text: "",

    // Terms & Conditions
    terms_hero_badge: "",
    terms_hero_title: "",
    terms_hero_subtitle: "",
    terms_agreement_title: "",
    terms_agreement_text: "",
    terms_card1_title: "",
    terms_card1_desc: "",
    terms_card2_title: "",
    terms_card2_desc: "",
    terms_card3_title: "",
    terms_card3_desc: "",
    terms_refund_title: "",
    terms_refund_text: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch settings from API
  const { data: settingsData = {}, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  // 2. Map data to form state
  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings({
        about_hero_badge: settingsData.about_hero_badge || "",
        about_hero_title: settingsData.about_hero_title || "",
        about_hero_subtitle: settingsData.about_hero_subtitle || "",
        about_journey_title: settingsData.about_journey_title || "",
        about_journey_text: settingsData.about_journey_text || settingsData.about_us || "",
        about_card1_title: settingsData.about_card1_title || "",
        about_card1_desc: settingsData.about_card1_desc || "",
        about_card2_title: settingsData.about_card2_title || "",
        about_card2_desc: settingsData.about_card2_desc || "",
        about_card3_title: settingsData.about_card3_title || "",
        about_card3_desc: settingsData.about_card3_desc || "",
        about_mission_title: settingsData.about_mission_title || "",
        about_mission_text: settingsData.about_mission_text || settingsData.about_us_mission || "",

        privacy_hero_badge: settingsData.privacy_hero_badge || "",
        privacy_hero_title: settingsData.privacy_hero_title || "",
        privacy_hero_subtitle: settingsData.privacy_hero_subtitle || "",
        privacy_overview_title: settingsData.privacy_overview_title || "",
        privacy_overview_text: settingsData.privacy_overview_text || settingsData.privacy_policy || "",
        privacy_card1_title: settingsData.privacy_card1_title || "",
        privacy_card1_desc: settingsData.privacy_card1_desc || "",
        privacy_card2_title: settingsData.privacy_card2_title || "",
        privacy_card2_desc: settingsData.privacy_card2_desc || "",
        privacy_card3_title: settingsData.privacy_card3_title || "",
        privacy_card3_desc: settingsData.privacy_card3_desc || "",
        privacy_guarantee_title: settingsData.privacy_guarantee_title || "",
        privacy_guarantee_text: settingsData.privacy_guarantee_text || "",

        terms_hero_badge: settingsData.terms_hero_badge || "",
        terms_hero_title: settingsData.terms_hero_title || "",
        terms_hero_subtitle: settingsData.terms_hero_subtitle || "",
        terms_agreement_title: settingsData.terms_agreement_title || "",
        terms_agreement_text: settingsData.terms_agreement_text || settingsData.terms_and_conditions || "",
        terms_card1_title: settingsData.terms_card1_title || "",
        terms_card1_desc: settingsData.terms_card1_desc || "",
        terms_card2_title: settingsData.terms_card2_title || "",
        terms_card2_desc: settingsData.terms_card2_desc || "",
        terms_card3_title: settingsData.terms_card3_title || "",
        terms_card3_desc: settingsData.terms_card3_desc || "",
        terms_refund_title: settingsData.terms_refund_title || "",
        terms_refund_text: settingsData.terms_refund_text || "",
      });
    }
  }, [settingsData]);

  // 3. Handle input/textarea changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Save settings to Database
  const handleSave = async () => {
    setIsSaving(true);
    const token = sessionStorage.getItem("auth_token") || "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}`, "X-Auth-Token": token } : {}),
          },
          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Legal & Content Pages Updated!",
          showConfirmButton: false,
          timer: 2000,
        });

        // Invalidate queries so both admin and customer refresh
        queryClient.invalidateQueries({ queryKey: ["settings"] });
        queryClient.invalidateQueries({ queryKey: ["store_settings"] });
      } else {
        Swal.fire("Error", result.message || "Failed to update content", "error");
      }
    } catch (error) {
      console.error("Save content error:", error);
      Swal.fire("Error", "Network connection failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-[var(--admin-muted)] text-sm">
        Loading Legal & Content Pages...
      </div>
    );
  }

  const subTabs = [
    { id: "about", label: "About Us Page", icon: <FaHeart /> },
    { id: "privacy", label: "Privacy Policy", icon: <FaShieldAlt /> },
    { id: "terms", label: "Terms & Conditions", icon: <FaFileContract /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ══ Header & Save Action Bar ══ */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 m-0 font-['Oswald',sans-serif] uppercase">
            <FaFileAlt className="text-amber-500" />
            Legal & Content Manager
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 m-0 font-sans">
            Configure 100% of the titles, descriptions, feature cards, and legal policies on the customer portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          <FaSave className="text-xs" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* ══ Sub-Section Navigation Chips ══ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-200 border-none ${
              activeSection === tab.id
                ? "btn-brand-cta"
                : "bg-slate-100 dark:bg-[#161616] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════
          1. ABOUT US EDITOR
      ═════════════════════════════════════════════════════════ */}
      {activeSection === "about" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Hero Section Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              1. Hero Header & Headline
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                  Top Pill Badge Tag
                </label>
                <input
                  type="text"
                  name="about_hero_badge"
                  value={settings.about_hero_badge}
                  onChange={handleChange}
                  placeholder="OUR STORY & PASSION"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                  Main Page Heading
                </label>
                <input
                  type="text"
                  name="about_hero_title"
                  value={settings.about_hero_title}
                  onChange={handleChange}
                  placeholder="ABOUT BIGBITE"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Hero Subtitle Description
              </label>
              <textarea
                name="about_hero_subtitle"
                rows={2}
                value={settings.about_hero_subtitle}
                onChange={handleChange}
                placeholder="Crafting mouth-watering burgers, loaded fries, cheesy pizzas..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Journey Section Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              2. Our Journey Section
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Section Heading
              </label>
              <input
                type="text"
                name="about_journey_title"
                value={settings.about_journey_title}
                onChange={handleChange}
                placeholder="Our Journey"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Journey Story Text
              </label>
              <textarea
                name="about_journey_text"
                rows={4}
                value={settings.about_journey_text}
                onChange={handleChange}
                placeholder="Detail the founding story, recipes, and culinary vision..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>

          {/* 3 Pillar Feature Cards */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              3. Three Pillar Feature Cards
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Pillar Card #1</span>
                <input
                  type="text"
                  name="about_card1_title"
                  value={settings.about_card1_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. 100% Fresh)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="about_card1_desc"
                  rows={3}
                  value={settings.about_card1_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Pillar Card #2</span>
                <input
                  type="text"
                  name="about_card2_title"
                  value={settings.about_card2_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. Hot Delivery)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="about_card2_desc"
                  rows={3}
                  value={settings.about_card2_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Pillar Card #3</span>
                <input
                  type="text"
                  name="about_card3_title"
                  value={settings.about_card3_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. Hygiene Assured)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="about_card3_desc"
                  rows={3}
                  value={settings.about_card3_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Mission Section Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              4. Our Mission Statement
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Section Heading
              </label>
              <input
                type="text"
                name="about_mission_title"
                value={settings.about_mission_title}
                onChange={handleChange}
                placeholder="Our Mission"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Mission Statement
              </label>
              <textarea
                name="about_mission_text"
                rows={3}
                value={settings.about_mission_text}
                onChange={handleChange}
                placeholder="Enter customer promise and dining vision..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          2. PRIVACY POLICY EDITOR
      ═════════════════════════════════════════════════════════ */}
      {activeSection === "privacy" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Hero Section Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              1. Hero Header & Subtitle
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                  Top Pill Badge Tag
                </label>
                <input
                  type="text"
                  name="privacy_hero_badge"
                  value={settings.privacy_hero_badge}
                  onChange={handleChange}
                  placeholder="DATA SECURITY & TRUST"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                  Main Page Heading
                </label>
                <input
                  type="text"
                  name="privacy_hero_title"
                  value={settings.privacy_hero_title}
                  onChange={handleChange}
                  placeholder="PRIVACY POLICY"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Hero Subtitle Description
              </label>
              <textarea
                name="privacy_hero_subtitle"
                rows={2}
                value={settings.privacy_hero_subtitle}
                onChange={handleChange}
                placeholder="How we protect, encrypt, and handle your information..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Overview Statement Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              2. Privacy Overview
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Section Heading
              </label>
              <input
                type="text"
                name="privacy_overview_title"
                value={settings.privacy_overview_title}
                onChange={handleChange}
                placeholder="Privacy Overview"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Policy Statement
              </label>
              <textarea
                name="privacy_overview_text"
                rows={4}
                value={settings.privacy_overview_text}
                onChange={handleChange}
                placeholder="Detail customer data collection, order coordinates, and encryption..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>

          {/* 3 Safeguard Cards */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              3. Three Data Safeguard Cards
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Safeguard #1</span>
                <input
                  type="text"
                  name="privacy_card1_title"
                  value={settings.privacy_card1_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. Encrypted Data)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="privacy_card1_desc"
                  rows={3}
                  value={settings.privacy_card1_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Safeguard #2</span>
                <input
                  type="text"
                  name="privacy_card2_title"
                  value={settings.privacy_card2_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. No Data Sharing)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="privacy_card2_desc"
                  rows={3}
                  value={settings.privacy_card2_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Safeguard #3</span>
                <input
                  type="text"
                  name="privacy_card3_title"
                  value={settings.privacy_card3_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. Transparent Usage)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="privacy_card3_desc"
                  rows={3}
                  value={settings.privacy_card3_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Guarantee Section Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              4. Data Protection Guarantee
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Section Heading
              </label>
              <input
                type="text"
                name="privacy_guarantee_title"
                value={settings.privacy_guarantee_title}
                onChange={handleChange}
                placeholder="Data Protection Guarantee"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Guarantee Statement
              </label>
              <textarea
                name="privacy_guarantee_text"
                rows={3}
                value={settings.privacy_guarantee_text}
                onChange={handleChange}
                placeholder="Enter physical, electronic, and administrative safeguards..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          3. TERMS & CONDITIONS EDITOR
      ═════════════════════════════════════════════════════════ */}
      {activeSection === "terms" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Hero Section Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              1. Hero Header & Subtitle
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                  Top Pill Badge Tag
                </label>
                <input
                  type="text"
                  name="terms_hero_badge"
                  value={settings.terms_hero_badge}
                  onChange={handleChange}
                  placeholder="TERMS OF SERVICE"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                  Main Page Heading
                </label>
                <input
                  type="text"
                  name="terms_hero_title"
                  value={settings.terms_hero_title}
                  onChange={handleChange}
                  placeholder="TERMS & CONDITIONS"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Hero Subtitle Description
              </label>
              <textarea
                name="terms_hero_subtitle"
                rows={2}
                value={settings.terms_hero_subtitle}
                onChange={handleChange}
                placeholder="Please review the terms and ordering guidelines..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Agreement Statement Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              2. Ordering & Service Agreement
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Section Heading
              </label>
              <input
                type="text"
                name="terms_agreement_title"
                value={settings.terms_agreement_title}
                onChange={handleChange}
                placeholder="Ordering & Service Agreement"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Agreement Terms Text
              </label>
              <textarea
                name="terms_agreement_text"
                rows={4}
                value={settings.terms_agreement_text}
                onChange={handleChange}
                placeholder="Detail customer terms of service, kitchen preparation, and delivery commitments..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>

          {/* 3 Terms Cards */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              3. Three Policy Pillar Cards
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Policy #1</span>
                <input
                  type="text"
                  name="terms_card1_title"
                  value={settings.terms_card1_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. Order Confirmation)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="terms_card1_desc"
                  rows={3}
                  value={settings.terms_card1_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Policy #2</span>
                <input
                  type="text"
                  name="terms_card2_title"
                  value={settings.terms_card2_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. Payment Terms)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="terms_card2_desc"
                  rows={3}
                  value={settings.terms_card2_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-amber-500 uppercase">Policy #3</span>
                <input
                  type="text"
                  name="terms_card3_title"
                  value={settings.terms_card3_title}
                  onChange={handleChange}
                  placeholder="Card Title (e.g. Delivery Schedule)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
                />
                <textarea
                  name="terms_card3_desc"
                  rows={3}
                  value={settings.terms_card3_desc}
                  onChange={handleChange}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Refund Guidelines Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              4. Cancellation & Refund Guidelines
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Section Heading
              </label>
              <input
                type="text"
                name="terms_refund_title"
                value={settings.terms_refund_title}
                onChange={handleChange}
                placeholder="Cancellation & Refund Guidelines"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                Refund Rules Text
              </label>
              <textarea
                name="terms_refund_text"
                rows={3}
                value={settings.terms_refund_text}
                onChange={handleChange}
                placeholder="Enter cancellation windows, missing item claims, and store credit policies..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ══ Sticky Bottom Save Bar ══ */}
      <div className="sticky bottom-4 z-20 p-3.5 bg-white/90 dark:bg-[#161616]/90 border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-xl flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="text-xs text-slate-500 dark:text-neutral-400 font-semibold hidden sm:block">
          Unsaved changes will not reflect on customer legal pages until saved.
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto btn-brand-cta px-6 py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 border-none"
        >
          <FaSave />
          <span>{isSaving ? "Saving..." : "Save Legal Settings"}</span>
        </button>
      </div>
    </div>
  );
};

export default LegalSettings;


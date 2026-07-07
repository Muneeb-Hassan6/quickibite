import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaSave, FaHeading } from "react-icons/fa";

const HeroTextSettings = () => {
  const [settings, setSettings] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_search_placeholder: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
        const result = await response.json();
        if (result.success && result.data) {
          setSettings({
            hero_title: result.data.hero_title || "",
            hero_subtitle: result.data.hero_subtitle || "",
            hero_search_placeholder: result.data.hero_search_placeholder || ""
          });
        }
      } catch (error) {
        console.error("Failed to load hero text settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/update_settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Hero text settings have been updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.message || "Failed to update settings.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ padding: "20px", color: "#fff" }}>Loading Hero Text Settings...</div>;

  return (
    <div style={{ background: "var(--admin-panel)", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid var(--admin-border)", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "#fff" }}>
          <FaHeading style={{ color: "var(--admin-orange)" }} /> Hero Static Content
        </h3>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ padding: "8px 15px", background: "var(--admin-orange)", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}
        >
          <FaSave /> {isSaving ? "Saving..." : "Save Content"}
        </button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "var(--admin-muted)", fontSize: "13px", fontWeight: "bold" }}>Hero Title (Supports HTML e.g. &lt;span style="color:red;"&gt;BIG BITE&lt;/span&gt;)</label>
          <input 
            type="text" 
            name="hero_title" 
            value={settings.hero_title} 
            onChange={handleChange} 
            style={{ width: "100%", padding: "10px", background: "var(--admin-bg)", border: "1px solid var(--admin-border)", color: "var(--admin-text)", borderRadius: "6px" }} 
            placeholder="WELCOME TO <span style='color:#ef4444;'>BIG BITE!</span>" 
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "5px", color: "var(--admin-muted)", fontSize: "13px", fontWeight: "bold" }}>Hero Subtitle</label>
          <input 
            type="text" 
            name="hero_subtitle" 
            value={settings.hero_subtitle} 
            onChange={handleChange} 
            style={{ width: "100%", padding: "10px", background: "var(--admin-bg)", border: "1px solid var(--admin-border)", color: "var(--admin-text)", borderRadius: "6px" }} 
            placeholder="Fresh Food, Delivered Hot & Fast." 
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "5px", color: "var(--admin-muted)", fontSize: "13px", fontWeight: "bold" }}>Search Placeholder</label>
          <input 
            type="text" 
            name="hero_search_placeholder" 
            value={settings.hero_search_placeholder} 
            onChange={handleChange} 
            style={{ width: "100%", padding: "10px", background: "var(--admin-bg)", border: "1px solid var(--admin-border)", color: "var(--admin-text)", borderRadius: "6px" }} 
            placeholder="Search your favorite food..." 
          />
        </div>
      </div>
    </div>
  );
};

export default HeroTextSettings;

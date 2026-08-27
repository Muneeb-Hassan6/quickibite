import React from 'react';
import {
  FaCog as IconCog,
  FaSave as IconSave,
  FaSpinner as IconSpinner,
} from 'react-icons/fa';

export default function GlobalHomepageSettings({
  globalSettings = { empty_homepage_message: '', hero_section_sort_order: '0' },
  setGlobalSettings,
  handleSaveGlobalSettings,
  isSavingGlobal = false,
}) {
  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <IconCog className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Global Homepage Settings
          </h3>
        </div>
        <button
          type="button"
          onClick={handleSaveGlobalSettings}
          disabled={isSavingGlobal}
          className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSavingGlobal ? (
            <IconSpinner className="animate-spin text-xs" />
          ) : (
            <IconSave className="text-xs" />
          )}
          <span>Save Settings</span>
        </button>
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Empty Homepage Fallback Notice
        </label>
        <input
          type="text"
          value={globalSettings.empty_homepage_message}
          onChange={(e) =>
            setGlobalSettings({
              ...globalSettings,
              empty_homepage_message: e.target.value,
            })
          }
          placeholder="No promotions currently active. Check back soon!"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>
  );
}

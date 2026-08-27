import React from 'react';
import LinkTargetSelector from './LinkTargetSelector';

export default function HeroSlideConfigForm({
  formData = {},
  setFormData,
  editId = null,
  menuItems = [],
  deals = [],
}) {
  return (
    <>
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Subtitle / Tagline
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="e.g. Hot & Fresh Pizza Bundles"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Banner Image {editId && <span className="text-[10px] text-slate-400 dark:text-neutral-500">(Leave blank to keep existing)</span>}
        </label>
        <input
          type="file"
          onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
          required={!editId}
          className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
        />
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Link / Target Action
        </label>
        <LinkTargetSelector
          value={formData.link_url}
          onChange={(val) => setFormData({ ...formData, link_url: val })}
          menuItems={menuItems}
          deals={deals}
        />
      </div>
    </>
  );
}

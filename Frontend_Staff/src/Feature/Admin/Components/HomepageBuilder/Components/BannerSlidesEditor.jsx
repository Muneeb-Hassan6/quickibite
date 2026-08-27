import React from 'react';
import { FaTrash as IconTrash } from 'react-icons/fa';
import LinkTargetSelector from './LinkTargetSelector';

export default function BannerSlidesEditor({
  bannerSlides = [],
  setBannerSlides,
  menuItems = [],
  deals = [],
}) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/10">
        <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white m-0">Banner Slides</h4>
        <button
          type="button"
          onClick={() => setBannerSlides([...bannerSlides, { title: '', subtitle: '', link_url: '', file: null, image_url: '' }])}
          className="btn-brand-cta px-3 py-1 text-[10px] uppercase tracking-wider cursor-pointer border-none"
        >
          + Add Slide
        </button>
      </div>

      {bannerSlides.map((slide, index) => (
        <div key={index} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 space-y-2 relative shadow-sm">
          {bannerSlides.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const newSlides = [...bannerSlides];
                newSlides.splice(index, 1);
                setBannerSlides(newSlides);
              }}
              className="absolute top-2 right-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer bg-transparent border-none"
            >
              <IconTrash className="text-xs" />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">Slide Title</label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => {
                  const newSlides = [...bannerSlides];
                  newSlides[index].title = e.target.value;
                  setBannerSlides(newSlides);
                }}
                className="w-full p-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">Slide Subtitle</label>
              <input
                type="text"
                value={slide.subtitle}
                onChange={(e) => {
                  const newSlides = [...bannerSlides];
                  newSlides[index].subtitle = e.target.value;
                  setBannerSlides(newSlides);
                }}
                className="w-full p-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">Target Action</label>
              <LinkTargetSelector
                value={slide.link_url}
                onChange={(val) => {
                  const newSlides = [...bannerSlides];
                  newSlides[index].link_url = val;
                  setBannerSlides(newSlides);
                }}
                isSmall={true}
                menuItems={menuItems}
                deals={deals}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">Upload Slide Banner Image</label>
              <input
                type="file"
                onChange={(e) => {
                  const newSlides = [...bannerSlides];
                  newSlides[index].file = e.target.files[0];
                  setBannerSlides(newSlides);
                }}
                required={!slide.image_url}
                className="w-full p-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

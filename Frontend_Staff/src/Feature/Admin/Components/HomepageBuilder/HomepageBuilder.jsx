import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import {
  FaTrash as IconTrash,
  FaPlus as IconPlus,
  FaSave as IconSave,
  FaImage as IconImage,
  FaListUl as IconListUl,
  FaEdit as IconEdit,
  FaCog as IconCog,
  FaToggleOn as IconToggleOn,
  FaToggleOff as IconToggleOff,
  FaTimes as IconTimes,
  FaSpinner as IconSpinner,
} from 'react-icons/fa';

import HeroTextSettings from './HeroTextSettings';
import FooterSettings from '../Settings/Components/FooterSettings';

const HomepageBuilder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [heroSlides, setHeroSlides] = useState([]);

  // Auth Helpers
  const getAuthToken = () => {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('staff_token') ||
      sessionStorage.getItem('auth_token') ||
      sessionStorage.getItem('token') ||
      ''
    );
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}`, 'X-Auth-Token': token } : {})
    };
  };

  const handleAuthError = () => {
    toast.error('Session expired or unauthorized (401). Redirecting to login...');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('staff_session');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('staff_token');
    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  // Global Settings for Homepage
  const [globalSettings, setGlobalSettings] = useState({
    hero_section_sort_order: '0',
    empty_homepage_message: ''
  });
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  // States for new section modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('section'); // 'section' or 'hero'
  const [editId, setEditId] = useState(null); // Track if editing
  const [isSavingComponent, setIsSavingComponent] = useState(false);

  const [formData, setFormData] = useState({
    section_type: 'product_slider',
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    content_data: 'filter:best_sellers',
    slider_type: 'regular',
    sort_order: 10,
    file: null
  });
  
  const [bannerSlides, setBannerSlides] = useState([{ title: '', subtitle: '', link_url: '', file: null, image_url: '' }]);

  // Use React Query for homepage data
  const { data: homepageData = {}, isLoading } = useQuery({
    queryKey: ['homepage_data'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_homepage_data.php?all=1`);
      const result = await response.json();
      return result.success && result.data ? result.data : {};
    }
  });

  const sections = homepageData.sections || [];
  
  // Update local states when data changes
  React.useEffect(() => {
    if (homepageData.hero_sliders) setHeroSlides(homepageData.hero_sliders);
    if (homepageData.settings) {
      setGlobalSettings({
        hero_section_sort_order: homepageData.settings.hero_section_sort_order || '0',
        empty_homepage_message: homepageData.settings.empty_homepage_message || ''
      });
    }
  }, [homepageData]);

  // Master Promo Banners Query
  const { data: masterBanners = { deals: [], products: [] }, refetch: refetchMasterBanners } = useQuery({
    queryKey: ['master_promo_banners'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/save_homepage_banners.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'get_all_banners' })
      });
      const data = await response.json();
      return data.success ? data.data : { deals: [], products: [] };
    }
  });

  const handleToggleMasterBanner = async (item, type) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/save_homepage_banners.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_banner_status',
          type: type,
          id: item.id,
          is_featured_banner: !item.is_featured_banner,
          banner_order: item.banner_order || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${item.name || item.title} ${!item.is_featured_banner ? 'activated on' : 'removed from'} homepage!`);
        refetchMasterBanners();
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      }
    } catch (e) {
      toast.error('Failed to update banner');
    }
  };

  const handleUpdateMasterBannerOrder = async (item, type, newOrder) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/save_homepage_banners.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_banner_status',
          type: type,
          id: item.id,
          is_featured_banner: item.is_featured_banner ? 1 : 0,
          banner_order: parseInt(newOrder || 0)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Display order updated!`);
        refetchMasterBanners();
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      }
    } catch (e) {
      toast.error('Failed to update order');
    }
  };

  const handleSaveGlobalSettings = async () => {
    setIsSavingGlobal(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/update_settings.php`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(globalSettings)
      });
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Global Settings Saved!',
          showConfirmButton: false,
          timer: 1500,
          background: '#171717',
          color: '#fff'
        });
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      } else {
        if (result.code === 401 || result.message === 'Unauthorized' || result.message === 'Access denied') {
          handleAuthError();
          return;
        }
        Swal.fire("Error", result.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Could not connect to server.", "error");
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const handleToggleStatus = async (id, type, currentActive) => {
    const nextActive = (currentActive === undefined || Number(currentActive) === 1) ? 0 : 1;
    const action = type === 'hero' ? 'toggle_hero_status' : 'toggle_section_status';

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, id, is_active: nextActive })
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const result = await response.json();
      if (result.success) {
        toast.success(nextActive === 1 ? `${type === 'hero' ? 'Slide' : 'Section'} enabled on homepage!` : `${type === 'hero' ? 'Slide' : 'Section'} hidden from homepage!`);
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      } else {
        if (result.code === 401 || result.message === 'Unauthorized' || result.message === 'Access denied') {
          handleAuthError();
          return;
        }
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error while updating status.");
    }
  };

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['active_deals'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_active_deals.php`);
      const data = await res.json();
      return data.success && data.data ? data.data : [];
    }
  });

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });
    const uploadedImg = await res.json();
    return uploadedImg.secure_url;
  };

  const handleDelete = async (id, type) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This item will be removed from your homepage layout.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Yes, Delete',
      background: '#171717',
      color: '#fff'
    });

    if (result.isConfirmed) {
      const action = type === 'hero' ? 'delete_hero' : 'delete_section';
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action, id })
        });

        if (response.status === 401) {
          handleAuthError();
          return;
        }

        const resultData = await response.json();
        if (resultData.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Item has been removed.',
            timer: 1500,
            showConfirmButton: false,
            background: '#171717',
            color: '#fff'
          });
          queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
        } else {
          if (resultData.code === 401 || resultData.message === 'Unauthorized' || resultData.message === 'Access denied') {
            handleAuthError();
            return;
          }
          Swal.fire('Error', resultData.message || 'Failed to delete item', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete item', 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSavingComponent(true);

    try {
      let finalImageUrl = formData.image_url;
      let finalContentData = formData.content_data;

      // Handle dynamic slides for banners
      if (modalType === 'section' && formData.section_type === 'banner') {
        const uploadedSlides = [];
        for (let i = 0; i < bannerSlides.length; i++) {
          let url = bannerSlides[i].image_url;
          if (bannerSlides[i].file) {
            url = await uploadToCloudinary(bannerSlides[i].file);
          }
          if (url) {
            uploadedSlides.push({
              title: bannerSlides[i].title,
              subtitle: bannerSlides[i].subtitle,
              link_url: bannerSlides[i].link_url,
              image_url: url
            });
          }
        }
        
        if (uploadedSlides.length > 0) {
          finalImageUrl = uploadedSlides[0].image_url;
          finalContentData = JSON.stringify(uploadedSlides);
          formData.title = formData.title || uploadedSlides[0].title || 'Banner Section';
        }
      } 
      // Handle single file for hero or other sections
      else if (formData.file) {
        finalImageUrl = await uploadToCloudinary(formData.file);
      }

      const action = modalType === 'hero' 
        ? (editId ? 'update_hero' : 'add_hero') 
        : (editId ? 'update_section' : 'add_section');
        
      if (formData.section_type === 'product_slider') {
        if (formData.content_data === 'custom_selection') {
          if (selectedProductIds.length === 0) {
            Swal.fire({
              icon: 'error',
              title: 'Validation Error',
              text: 'Please select at least one product for custom selection.',
              background: '#171717',
              color: '#fff'
            });
            setIsSavingComponent(false);
            return;
          }
          finalContentData = `custom:${selectedProductIds.join(',')}`;
        }
      }

      const payload = {
        action,
        id: editId,
        ...formData,
        content_data: finalContentData,
        image_url: finalImageUrl
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const res = await response.json();
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: editId ? 'Component updated successfully.' : 'New component added.',
          timer: 1500,
          showConfirmButton: false,
          background: '#171717',
          color: '#fff'
        });
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      } else {
        if (res.code === 401 || res.message === 'Unauthorized' || res.message === 'Access denied') {
          handleAuthError();
          return;
        }
        Swal.fire('Error', res.message || 'Failed to save component', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Something went wrong: ' + err.message, 'error');
    } finally {
      setIsSavingComponent(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setEditId(null);
    setFormData({
      section_type: type === 'hero' ? 'hero' : 'product_slider',
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      content_data: 'filter:best_sellers',
      slider_type: 'regular',
      sort_order: (type === 'hero' ? heroSlides.length : sections.length) + 1,
      file: null
    });
    setBannerSlides([{ title: '', subtitle: '', link_url: '', file: null, image_url: '' }]);
    setSelectedProductIds([]);
    setIsModalOpen(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setEditId(item.id);
    
    let contentData = item.content_data || 'filter:best_sellers';
    let parsedIds = [];
    if (contentData.startsWith('custom:')) {
      const idsStr = contentData.split(':')[1];
      if (idsStr) {
        parsedIds = idsStr.split(',').map(id => parseInt(id));
      }
      contentData = 'custom_selection';
    }

    if (item.section_type === 'banner') {
      try {
        if (item.content_data && item.content_data.startsWith('[')) {
          const parsed = JSON.parse(item.content_data);
          setBannerSlides(parsed.map(slide => ({
            ...slide,
            file: null
          })));
        } else {
          setBannerSlides([{ title: item.title || '', subtitle: item.subtitle || '', link_url: item.link_url || '', file: null, image_url: item.image_url || '' }]);
        }
      } catch (e) {
        setBannerSlides([{ title: item.title || '', subtitle: item.subtitle || '', link_url: item.link_url || '', file: null, image_url: item.image_url || '' }]);
      }
    } else {
      setBannerSlides([{ title: '', subtitle: '', link_url: '', file: null, image_url: '' }]);
    }

    setFormData({
      section_type: item.section_type || 'hero',
      title: item.title || '',
      subtitle: item.subtitle || '',
      image_url: item.image_url || '',
      link_url: item.link_url || '',
      content_data: contentData,
      slider_type: item.slider_type || 'regular',
      sort_order: item.sort_order || 1,
      file: null
    });
    setSelectedProductIds(parsedIds);
    setIsModalOpen(true);
  };

  const handleProductSelect = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(pid => pid !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const parseLink = (url) => {
    if (url?.startsWith('product:')) return { type: 'product', id: url.split(':')[1] };
    if (url?.startsWith('deal:')) return { type: 'deal', id: url.split(':')[1] };
    return { type: 'url', value: url || '' };
  };

  const buildLink = (type, value) => {
    if (type === 'product') return `product:${value}`;
    if (type === 'deal') return `deal:${value}`;
    return value;
  };

  const renderLinkInput = (value, onChange, isSmall = false) => {
    const parsed = parseLink(value);
    return (
      <div className={`flex gap-2 ${isSmall ? 'mt-1' : 'mt-1.5'}`}>
        <select 
          value={parsed.type} 
          onChange={e => onChange(buildLink(e.target.value, ''))}
          className="p-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option className="bg-white dark:bg-[#171717]" value="url">Standard URL</option>
          <option className="bg-white dark:bg-[#171717]" value="product">Link to Product</option>
          <option className="bg-white dark:bg-[#171717]" value="deal">Link to Deal</option>
        </select>
        
        {parsed.type === 'url' && (
          <input 
            type="text" 
            placeholder="/menu"
            value={parsed.value} 
            onChange={e => onChange(e.target.value)}
            className="flex-1 p-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        )}
        
        {parsed.type === 'product' && (
          <select 
            value={parsed.id || ''} 
            onChange={e => onChange(buildLink('product', e.target.value))}
            className="flex-1 p-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option className="bg-white dark:bg-[#171717]" value="">Select a Product...</option>
            {menuItems.map(item => <option className="bg-white dark:bg-[#171717]" key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        )}

        {parsed.type === 'deal' && (
          <select 
            value={parsed.id || ''} 
            onChange={e => onChange(buildLink('deal', e.target.value))}
            className="flex-1 p-2 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option className="bg-white dark:bg-[#171717]" value="">Select a Deal...</option>
            {deals.map(deal => <option className="bg-white dark:bg-[#171717]" key={deal.id} value={deal.id}>{deal.title}</option>)}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Homepage Layout & Dynamic Content Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Customize hero banners, promotional sliders, deal carousels, and footer brand identity.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
          Loading Dynamic Homepage Layout...
        </div>
      )}

      {/* 1. Global Homepage Settings */}
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
            {isSavingGlobal ? <IconSpinner className="animate-spin text-xs" /> : <IconSave className="text-xs" />}
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
            onChange={(e) => setGlobalSettings({ ...globalSettings, empty_homepage_message: e.target.value })}
            placeholder="No promotions currently active. Check back soon!"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* 2. Hero Static Content Settings */}
      <HeroTextSettings />

      {/* 3. Hero Carousel Slides */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <IconImage className="text-amber-500 text-sm" />
            <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              Hero Carousel Slides ({heroSlides.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => openModal('hero')}
            className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none active:scale-95"
          >
            <IconPlus className="text-xs" />
            <span>Add Slide</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {heroSlides.map((slide) => {
            const isSlideActive = slide.is_active === undefined || Number(slide.is_active) === 1;
            return (
              <div
                key={slide.id}
                className={`admin-card-surface bg-slate-50 dark:bg-[#111111] p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-slate-900 dark:text-white ${
                  isSlideActive ? 'border-slate-200 dark:border-white/10' : 'border-slate-200 dark:border-white/5 opacity-50'
                }`}
              >
                <div className="aspect-[21/9] w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-black/60 border border-slate-300 dark:border-white/5 relative">
                  <img
                    src={slide.image_url}
                    alt={slide.title || 'Slide'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/800x350?text=Hero+Slide';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 border border-white/10 text-[10px] font-black font-mono">
                    Order #{slide.sort_order}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-white/5">
                  <div className="min-w-0 pr-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                      {slide.title || 'Untitled Slide'}
                    </span>
                    {slide.subtitle && (
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 block truncate">
                        {slide.subtitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(slide.id, 'hero', isSlideActive ? 1 : 0)}
                      className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                        isSlideActive
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isSlideActive ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(slide, 'hero')}
                      className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-neutral-950 border border-slate-300 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                      title="Edit Slide"
                    >
                      <IconEdit className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slide.id, 'hero')}
                      className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 dark:text-red-400 hover:text-white border border-red-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                      title="Delete Slide"
                    >
                      <IconTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Homepage Promo Banners Master Control */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <IconImage className="text-amber-500 text-sm" />
              <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                Homepage Promo Banners Master Control
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5">
              Activate food item & combo cards as wide bottom promotional banners on homepage.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-black text-xs">
            {([...masterBanners.deals, ...masterBanners.products].filter((b) => b.is_featured_banner).length)} Live on Home
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...masterBanners.deals, ...masterBanners.products].map((item) => {
            const isLive = Boolean(item.is_featured_banner);
            const bannerImg = item.promo_banner_image || item.img;

            return (
              <div
                key={`${item.type}-${item.id}`}
                className={`admin-card-surface bg-white dark:bg-[#161616] p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-slate-900 dark:text-white shadow-sm ${
                  isLive ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-slate-200 dark:border-white/5'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={bannerImg}
                    alt={item.name || item.title}
                    className="w-16 h-12 object-cover rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/180x110?text=Banner';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-0.5 !rounded-full ${
                          item.type === 'deal'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                        Rs. {parseFloat(item.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <strong className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">
                      {item.name || item.title}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                    <span className="text-[10px] font-bold">Order:</span>
                    <input
                      type="number"
                      min="0"
                      defaultValue={item.banner_order || 0}
                      onBlur={(e) => handleUpdateMasterBannerOrder(item, item.type, e.target.value)}
                      className="w-12 p-1 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg text-center text-xs font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleMasterBanner(item, item.type)}
                    className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                      isLive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-neutral-500/15 text-slate-600 dark:text-neutral-400 border-slate-300 dark:border-neutral-500/30'
                    }`}
                  >
                    {isLive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Dynamic Homepage Sections */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <IconListUl className="text-amber-500 text-sm" />
            <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              Homepage Dynamic Sections ({sections.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => openModal('section')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-amber-500/20 border-none"
          >
            <IconPlus className="text-xs" />
            <span>Add Section</span>
          </button>
        </div>

        <div className="space-y-3">
          {sections.map((sec) => {
            const isSecActive = sec.is_active === undefined || Number(sec.is_active) === 1;
            return (
              <div
                key={sec.id}
                className={`admin-card-surface bg-slate-50 dark:bg-[#111111] p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSecActive ? 'border-slate-200 dark:border-white/10' : 'border-slate-200 dark:border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-black text-xs shrink-0 font-mono">
                    {sec.sort_order}
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                      {sec.title || sec.section_type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold block">
                      Type: {sec.section_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(sec.id, 'section', isSecActive ? 1 : 0)}
                    className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                      isSecActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isSecActive ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(sec, 'section')}
                    className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-neutral-950 border border-slate-300 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Edit Section"
                  >
                    <IconEdit className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sec.id, 'section')}
                    className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 dark:text-red-400 hover:text-white border border-red-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Delete Section"
                  >
                    <IconTrash className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Footer Settings Integration */}
      <FooterSettings />

      {/* ADD / EDIT COMPONENT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-card-surface w-full max-w-lg bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <h3 className="m-0 text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                  {editId ? 'Edit' : 'Add'} {modalType === 'hero' ? 'Hero Slide' : 'Homepage Section'}
                </h3>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <IconTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {modalType === 'section' && (
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Section Type *
                  </label>
                  <select
                    value={formData.section_type}
                    onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option className="bg-white dark:bg-[#171717]" value="product_slider">Product Slider</option>
                    <option className="bg-white dark:bg-[#171717]" value="banner">Promotional Banner</option>
                    <option className="bg-white dark:bg-[#171717]" value="explore_menu">Explore Menu (Categories bubbles)</option>
                    <option className="bg-white dark:bg-[#171717]" value="hero">Hero Slider Component</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Section Heading *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. TOP DEALS, BEST SELLERS"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {modalType === 'section' && formData.section_type !== 'banner' && (
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Button Text / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. View All Deals"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {modalType === 'hero' && (
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
                    {renderLinkInput(formData.link_url, (val) => setFormData({ ...formData, link_url: val }))}
                  </div>
                </>
              )}

              {/* Dynamic Slides for Banner Section */}
              {modalType === 'section' && formData.section_type === 'banner' && (
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
                          {renderLinkInput(
                            slide.link_url,
                            (val) => {
                              const newSlides = [...bannerSlides];
                              newSlides[index].link_url = val;
                              setBannerSlides(newSlides);
                            },
                            true
                          )}
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
              )}

              {modalType === 'section' && formData.section_type === 'product_slider' && (
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Data Source (Catalog Items)
                  </label>
                  <select
                    value={formData.content_data}
                    onChange={(e) => setFormData({ ...formData, content_data: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option className="bg-white dark:bg-[#171717]" value="filter:best_sellers">Best Sellers</option>
                    <option className="bg-white dark:bg-[#171717]" value="filter:top_deals">Top Deals & Combos</option>
                    <option className="bg-white dark:bg-[#171717]" value="custom_selection">Custom Selection (Select Manually)</option>
                    {categories.map((c) => (
                      <option className="bg-white dark:bg-[#171717]" key={c.id} value={`category:${c.name}`}>
                        Category: {c.name}
                      </option>
                    ))}
                  </select>

                  {formData.content_data === 'custom_selection' && (
                    <div className="p-3 mt-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Check Items to Include:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {menuItems.map((item) => {
                          const isSelected = selectedProductIds.includes(item.id);
                          return (
                            <label
                              key={item.id}
                              onClick={() => handleProductSelect(item.id)}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                                isSelected
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
                                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-neutral-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="accent-amber-500"
                              />
                              <span className="truncate">{item.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingComponent}
                  className="btn-brand-cta px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 active:scale-95"
                >
                  {isSavingComponent ? <IconSpinner className="animate-spin text-xs" /> : <IconSave className="text-xs" />}
                  <span>Save Component</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageBuilder;

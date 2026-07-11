import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaPlus, FaSave, FaImage, FaListUl, FaEdit, FaCog } from 'react-icons/fa';
import FooterSettings from '../Settings/Components/FooterSettings';

const HomepageBuilder = () => {
  const [sections, setSections] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const [formData, setFormData] = useState({
    section_type: 'product_slider',
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    content_data: 'filter:best_sellers',
    slider_type: 'regular',
    sort_order: 10
  });
  
  const [bannerSlides, setBannerSlides] = useState([{ title: '', subtitle: '', link_url: '', file: null, image_url: '' }]);

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [deals, setDeals] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchMenuItems();
    fetchDeals();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_homepage_data.php`);
      const result = await response.json();
      if (result.success && result.data) {
        setHeroSlides(result.data.hero_sliders || []);
        setSections(result.data.sections || []);
        if (result.data.settings) {
          setGlobalSettings({
            hero_section_sort_order: result.data.settings.hero_section_sort_order || '0',
            empty_homepage_message: result.data.settings.empty_homepage_message || ''
          });
        }
      }
    } catch (error) {
      console.error("Error fetching homepage data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setIsSavingGlobal(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/update_settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalSettings)
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Homepage Settings Saved!", showConfirmButton: false, timer: 1500 });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not connect to server.", "error");
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`);
      const data = await res.json();
      if(Array.isArray(data)) setCategories(data);
    } catch(err) {
      console.error(err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await res.json();
      if (Array.isArray(data)) setMenuItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeals = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_active_deals.php`);
      const data = await res.json();
      if (data.success && data.data) setDeals(data.data);
    } catch (err) {
      console.error(err);
    }
  };

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
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const action = type === 'hero' ? 'delete_hero' : 'delete_section';
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action, id })
        });
        const res = await response.json();
        if (res.success) {
          Swal.fire('Deleted!', 'Item has been deleted.', 'success');
          fetchData();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete item', 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
            Swal.fire('Error', 'Please select at least one product for custom selection.', 'error');
            setIsLoading(false);
            return;
          }
          finalContentData = `custom:${selectedProductIds.join(',')}`;
        }
      }

      const payload = {
        action,
        id: editId, // Include ID if editing
        ...formData,
        content_data: finalContentData,
        image_url: finalImageUrl
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const res = await response.json();
      if (res.success) {
        Swal.fire('Saved!', editId ? 'Item updated successfully' : 'New item added successfully', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        Swal.fire('Error', 'Failed to save: ' + JSON.stringify(res), 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
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
      <div style={{ display: 'flex', gap: '10px', marginTop: isSmall ? '4px' : '5px' }}>
        <select 
          value={parsed.type} 
          onChange={e => onChange(buildLink(e.target.value, ''))}
          style={{ flex: 1, padding: isSmall ? '8px' : '10px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
        >
          <option value="url">Standard URL</option>
          <option value="product">Link to Product</option>
          <option value="deal">Link to Deal</option>
        </select>
        
        {parsed.type === 'url' && (
          <input 
            type="text" placeholder="/menu"
            value={parsed.value} 
            onChange={e => onChange(e.target.value)}
            style={{ flex: 2, padding: isSmall ? '8px' : '10px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          />
        )}
        
        {parsed.type === 'product' && (
          <select 
            value={parsed.id || ''} 
            onChange={e => onChange(buildLink('product', e.target.value))}
            style={{ flex: 2, padding: isSmall ? '8px' : '10px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          >
            <option value="">Select a Product...</option>
            {menuItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        )}

        {parsed.type === 'deal' && (
          <select 
            value={parsed.id || ''} 
            onChange={e => onChange(buildLink('deal', e.target.value))}
            style={{ flex: 2, padding: isSmall ? '8px' : '10px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          >
            <option value="">Select a Deal...</option>
            {deals.map(deal => <option key={deal.id} value={deal.id}>{deal.title}</option>)}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="admin-panel-content">
      <style>{`
        .styled-file-input {
          width: 100%;
          margin-top: 4px;
          color: var(--admin-text, #fff);
          background: var(--admin-bg, #1a1a1a);
          border: 1px solid var(--admin-border, #333);
          border-radius: 4px;
          padding: 6px;
          font-size: 13px;
        }
        .styled-file-input::file-selector-button {
          background: #333;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
          font-weight: 500;
          transition: background 0.3s;
        }
        .styled-file-input::file-selector-button:hover {
          background: #ef4444; /* brand red */
        }
        /* Custom Scrollbar for modal */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }
        .modal-content::-webkit-scrollbar-track {
          background: var(--admin-bg, #1a1a1a);
          border-radius: 4px;
        }
        .modal-content::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Homepage Builder</h2>
          <p className="panel-subtitle">Manage your dynamic homepage layout, banners, and sliders</p>
        </div>
      </div>

      {isLoading && <div className="loading-spinner" style={{textAlign:'center', padding:'2rem'}}>Loading...</div>}

      {/* Changed layout to Flex Column to prevent width mismatch and scrollbars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
        
        {/* GLOBAL HOMEPAGE SETTINGS */}
        <div style={{ background: 'var(--admin-panel)', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--admin-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3><FaCog /> Global Homepage Settings</h3>
            <button onClick={handleSaveGlobalSettings} disabled={isSavingGlobal} style={{ padding: '8px 12px', fontSize: '12px', background: 'var(--brand-red)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaSave /> {isSavingGlobal ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: 'var(--admin-muted)' }}>Empty Homepage Message</label>
              <input 
                type="text" 
                value={globalSettings.empty_homepage_message} 
                onChange={e => setGlobalSettings({...globalSettings, empty_homepage_message: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
              />
              <small style={{ color: 'var(--admin-muted)', display: 'block', marginTop: '4px' }}>Text to show if no sections are added.</small>
            </div>
          </div>
        </div>

        {/* HERO SLIDERS */}
        <div style={{ background: 'var(--admin-panel)', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--admin-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3><FaImage /> Hero Slides</h3>
            <button onClick={() => openModal('hero')} style={{ padding: '8px 12px', fontSize: '12px', background: 'var(--admin-orange)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <FaPlus /> Add Slide
            </button>
          </div>
          {heroSlides.map((slide) => (
            <div key={slide.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', padding: '10px', borderRadius: '8px' }}>
              <img src={slide.image_url} alt="hero" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              <div style={{ flex: 1, color: 'var(--admin-text)' }}>
                <strong style={{ display: 'block', fontSize: '14px' }}>{slide.title || 'No Title'}</strong>
                <small style={{ color: 'var(--admin-muted)' }}>Order: {slide.sort_order}</small>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEdit(slide, 'hero')} style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(slide.id, 'hero')} style={{ background: 'var(--admin-bg)', color: '#ef4444', border: '1px solid var(--admin-border)', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* HOMEPAGE SECTIONS */}
        <div style={{ background: 'var(--admin-panel)', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--admin-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3><FaListUl /> Homepage Sections</h3>
            <button onClick={() => openModal('section')} style={{ padding: '8px 12px', fontSize: '12px', background: 'var(--admin-orange)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <FaPlus /> Add Section
            </button>
          </div>
          {sections.map((sec) => (
            <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', border: '1px solid var(--admin-border)', padding: '15px', borderRadius: '8px', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
              <div style={{ background: 'var(--admin-orange)', color: '#fff', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', fontWeight: 'bold' }}>
                {sec.sort_order}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '16px' }}>{sec.title || sec.section_type.toUpperCase()}</strong>
                <span style={{ fontSize: '12px', background: 'var(--admin-panel)', padding: '2px 8px', borderRadius: '12px', color: 'var(--admin-muted)', border: '1px solid var(--admin-border)' }}>
                  {sec.section_type} 
                  {(() => {
                    if (sec.section_type === 'banner' && sec.content_data && sec.content_data.startsWith('[')) {
                      try {
                        return ` (${JSON.parse(sec.content_data).length} Slides)`;
                      } catch(e) {
                        return ' (Dynamic Banner)';
                      }
                    }
                    if (sec.content_data && sec.section_type === 'product_slider') {
                      if (sec.content_data.startsWith('custom:')) {
                        return ' (Custom Products)';
                      }
                      if (sec.content_data.startsWith('category:')) {
                        return ` (${sec.content_data.split(':')[1]})`;
                      }
                      if (sec.content_data === 'filter:best_sellers') return ' (Best Sellers)';
                      if (sec.content_data === 'filter:top_deals') return ' (Top Deals)';
                      
                      const dataStr = sec.content_data.length > 30 ? sec.content_data.substring(0, 30) + '...' : sec.content_data;
                      return ` (${dataStr})`;
                    }
                    return sec.content_data ? ` (${sec.content_data})` : '';
                  })()}
                  {sec.section_type === 'product_slider' ? ` [${sec.slider_type || 'regular'}]` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEdit(sec, 'section')} style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(sec.id, 'section')} style={{ background: 'var(--admin-bg)', color: '#ef4444', border: '1px solid var(--admin-border)', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER SETTINGS INTEGRATION */}
        <div style={{ background: 'var(--admin-panel)', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--admin-border)' }}>
          <FooterSettings />
        </div>
      </div>

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editId ? 'Edit' : 'Add'} {modalType === 'hero' ? 'Hero Slide' : 'Homepage Section'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              
              {modalType === 'section' && (
                <div>
                  <label>Section Type</label>
                  <select 
                    value={formData.section_type} 
                    onChange={e => setFormData({...formData, section_type: e.target.value})}
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                  >
                    <option value="product_slider">Product Slider</option>
                    <option value="banner">Promotional Banner</option>
                    <option value="explore_menu">Explore Menu (Categories bubbles)</option>
                    <option value="hero">Hero Slider Component</option>
                  </select>
                </div>
              )}

              <div>
                <label>Section Title (Heading on Website)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. TOP DEALS"
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                  required
                />
              </div>

              {modalType === 'section' && formData.section_type !== 'banner' && (
                <div>
                  <label>Button Text / Subtitle (e.g. "VIEW ALL")</label>
                  <input 
                    type="text" 
                    value={formData.subtitle} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                    placeholder="e.g. Explore All Deals"
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                  />
                </div>
              )}

              {/* Only show these fields if it's Hero Slide */}
              {modalType === 'hero' && (
                <>
                  <div>
                    <label>Subtitle</label>
                    <input 
                      type="text" 
                      value={formData.subtitle} 
                      onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                      style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span>Image Upload {editId && <small> (Leave blank to keep existing image)</small>}</span>
                      <span style={{ color: 'var(--admin-orange)', fontSize: '11px', fontStyle: 'italic' }}>(Recommended: 1920x600 or 28:9 Ratio)</span>
                    </label>
                    <input 
                      type="file" 
                      className="styled-file-input"
                      onChange={e => setFormData({...formData, file: e.target.files[0]})} 
                      required={!editId}
                    />
                  </div>
                  <div>
                    <label>Link / Action</label>
                    {renderLinkInput(formData.link_url, val => setFormData({...formData, link_url: val}))}
                  </div>
                </>
              )}

              {/* Dynamic Slides for Banner Section */}
              {modalType === 'section' && formData.section_type === 'banner' && (
                <div style={{ padding: '15px', border: '1px solid var(--admin-border)', borderRadius: '8px', background: 'var(--admin-panel)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0 }}>Banner Slides</h4>
                    <button type="button" onClick={() => setBannerSlides([...bannerSlides, { title: '', subtitle: '', link_url: '', file: null, image_url: '' }])} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--brand-red)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      <FaPlus /> Add Slide
                    </button>
                  </div>

                  {bannerSlides.map((slide, index) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px dashed var(--admin-border)', borderRadius: '6px', position: 'relative' }}>
                      {bannerSlides.length > 1 && (
                        <button type="button" onClick={() => {
                          const newSlides = [...bannerSlides];
                          newSlides.splice(index, 1);
                          setBannerSlides(newSlides);
                        }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <FaTrash />
                        </button>
                      )}
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '12px' }}>Slide Title</label>
                          <input type="text" value={slide.title} onChange={e => {
                            const newSlides = [...bannerSlides];
                            newSlides[index].title = e.target.value;
                            setBannerSlides(newSlides);
                          }} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px' }}>Slide Subtitle</label>
                          <input type="text" value={slide.subtitle} onChange={e => {
                            const newSlides = [...bannerSlides];
                            newSlides[index].subtitle = e.target.value;
                            setBannerSlides(newSlides);
                          }} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }} />
                        </div>
                        <div style={{ gridColumn: '1 / span 2' }}>
                          <label style={{ fontSize: '12px' }}>Link / Action</label>
                          {renderLinkInput(slide.link_url, val => {
                            const newSlides = [...bannerSlides];
                            newSlides[index].link_url = val;
                            setBannerSlides(newSlides);
                          }, true)}
                        </div>
                        <div style={{ gridColumn: '1 / span 2' }}>
                          <label style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            Image Upload
                            <span style={{ color: 'var(--admin-orange)', fontStyle: 'italic' }}>(Recommended: 1920x800 or 24:9 Ratio)</span>
                          </label>
                          {slide.image_url && <small style={{ display: 'block', color: 'green', marginBottom: '2px' }}>Existing image active</small>}
                          <input type="file" className="styled-file-input" onChange={e => {
                            const newSlides = [...bannerSlides];
                            newSlides[index].file = e.target.files[0];
                            setBannerSlides(newSlides);
                          }} required={!slide.image_url} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {modalType === 'section' && formData.section_type === 'product_slider' && (
                <>
                  <div>
                    <label>Slider Layout</label>
                    <select 
                      value={formData.slider_type} 
                      onChange={e => setFormData({...formData, slider_type: e.target.value})}
                      style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                    >
                      <option value="regular">Regular Horizontal Slider</option>
                      <option value="stacked">Cinematic Showcase (Stacked)</option>
                      <option value="glassmorphism">3D Glassmorphism Coverflow</option>
                      <option value="bento">Dynamic Bento Grid</option>
                      <option value="parallax">Parallax Depth Showcase</option>
                      <option value="revolving">Circular Revolving Stage</option>
                      <option value="deck">Neon Cyberpunk Deck</option>
                      <option value="split">Magazine Split-Screen</option>
                      <option value="marquee">Endless Marquee</option>
                      <option value="bubbles">Floating Gravity Bubbles</option>
                      <option value="skewed">Aggressive Skewed Speed-Grid</option>
                      <option value="inventory">Cyberpunk Inventory Slots</option>
                      <option value="vertical-accordion">Cinematic Vertical Accordion</option>
                    </select>
                  </div>

                  <div>
                    <label>Data Source (Content)</label>
                  <select 
                    value={formData.content_data} 
                    onChange={e => setFormData({...formData, content_data: e.target.value})}
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                  >
                    <option value="filter:best_sellers">Best Sellers</option>
                    <option value="filter:top_deals">Top Deals & Combos</option>
                    <option value="custom_selection">Custom Selection (Select Manually)</option>
                    {categories.map(c => (
                      <option key={c.id} value={`category:${c.name}`}>Category: {c.name}</option>
                    ))}
                  </select>

                  {formData.content_data === 'custom_selection' && (
                    <div style={{ marginTop: '15px', background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '5px', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Products for Slider:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {menuItems.map(item => (
                          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedProductIds.includes(parseInt(item.id))}
                              onChange={() => handleProductSelect(parseInt(item.id))}
                            />
                            {item.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </>
              )}

              <div>
                <label>Sort Order</label>
                <input 
                  type="number" 
                  min="1"
                  max={modalType === 'hero' ? Math.max(heroSlides.length + (editId ? 0 : 1), 1) : Math.max(sections.length + (editId ? 0 : 1), 1)}
                  value={formData.sort_order} 
                  onChange={e => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) val = 1;
                    if (val < 1) val = 1;
                    
                    const maxAllowed = modalType === 'hero' 
                      ? Math.max(heroSlides.length + (editId ? 0 : 1), 1) 
                      : Math.max(sections.length + (editId ? 0 : 1), 1);
                      
                    if (val > maxAllowed) val = maxAllowed;
                    
                    setFormData({...formData, sort_order: val});
                  }} 
                  style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                  required
                />
                <small style={{ color: 'var(--admin-muted)', display: 'block', marginTop: '4px' }}>
                  Position order (1 to {modalType === 'hero' ? Math.max(heroSlides.length + (editId ? 0 : 1), 1) : Math.max(sections.length + (editId ? 0 : 1), 1)})
                </small>
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'var(--admin-panel)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--admin-orange)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Component'}
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

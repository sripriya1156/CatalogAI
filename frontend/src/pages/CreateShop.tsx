import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CreateShop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!id;

  // Form State
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('General');
  const [about, setAbout] = useState('');
  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [phone, setPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  
  // Theme branding settings
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [fontColor, setFontColor] = useState('#1F2937');
  const [font, setFont] = useState('Inter');

  // AI Assistance parameters
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiAudience, setAiAudience] = useState('');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiImgPrompt, setAiImgPrompt] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEO Metadata State
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isImprovingDesc, setIsImprovingDesc] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchShopDetails();
    }
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      const res = await api.get(`/shops/slug/${id}`);
      if (res.data.success) {
        const shop = res.data.data;
        setShopName(shop.shopName);
        setCategory(shop.category);
        setAbout(shop.about);
        setLogo(shop.logo || '');
        setBanner(shop.banner || '');
        setPhone(shop.phone || '');
        setBusinessEmail(shop.businessEmail || '');
        setWebsite(shop.website || '');
        setAddress(shop.address || '');
        setInstagram(shop.instagram || '');
        setFacebook(shop.facebook || '');
        setLinkedin(shop.linkedin || '');
        setSeoTitle(shop.seoTitle || '');
        setMetaDescription(shop.metaDescription || '');
        setSeoKeywords(shop.seoKeywords ? shop.seoKeywords.join(', ') : '');
        if (shop.theme) {
          setPrimaryColor(shop.theme.primaryColor || '#4F46E5');
          setSecondaryColor(shop.theme.secondaryColor || '#10B981');
          setFontColor(shop.theme.fontColor || '#1F2937');
          setFont(shop.theme.font || 'Inter');
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to fetch shop settings', 'error');
    }
  };

  // Real File Upload to Cloudinary via Backend
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    showToast(`Uploading ${file.name}...`, 'info');
    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        const uploadedUrl = res.data.url;
        if (target === 'logo') setLogo(uploadedUrl);
        else setBanner(uploadedUrl);
        showToast(`${target === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'File upload failed.';
      showToast(errMsg, 'error');
    }
  };

  // Call AI Description Generator
  const handleAIDescription = async () => {
    // Client-side cost protection check
    if (!shopName.trim() || !category.trim()) {
      showToast('Form validation error: Shop name and category are required before generating a description.', 'error');
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const response = await api.post('/ai/generate-description', {
        name: shopName.trim(),
        category: category.trim(),
        keywords: aiKeywords,
        targetAudience: aiAudience,
        tone: aiTone,
        type: 'shop',
      });

      if (response.data.success) {
        const generated = response.data.data.description;
        
        // Typing animation effect on description
        setAbout('');
        let currentText = '';
        const words = generated.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            currentText += (i === 0 ? '' : ' ') + words[i];
            setAbout(currentText);
            i++;
          } else {
            clearInterval(interval);
            showToast('AI Description generated!', 'success');
          }
        }, 50);

      }
    } catch (err: any) {
      console.error(err);
      showToast('AI Description generator failed.', 'error');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Call AI Description Polisher
  const handlePolishDescription = async () => {
    if (!about || !about.trim()) {
      showToast('Form validation error: Write a draft description first before polishing.', 'error');
      return;
    }

    setIsImprovingDesc(true);
    try {
      const response = await api.post('/ai/improve-description', {
        description: about,
        tone: aiTone,
      });

      if (response.data.success) {
        const polished = response.data.data.improvedDescription;
        setAbout('');
        let currentText = '';
        const words = polished.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            currentText += (i === 0 ? '' : ' ') + words[i];
            setAbout(currentText);
            i++;
          } else {
            clearInterval(interval);
            showToast('AI Description polished successfully!', 'success');
          }
        }, 40);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'AI Polishing failed.';
      showToast(errorMsg, 'error');
    } finally {
      setIsImprovingDesc(false);
    }
  };

  // Call AI SEO Metadata Generator
  const handleGenerateSeo = async () => {
    if (!shopName || !shopName.trim()) {
      showToast('Form validation error: Shop name is required to generate SEO metadata.', 'error');
      return;
    }
    if (!about || !about.trim()) {
      showToast('Form validation error: Describe your shop first to generate relevant SEO tags.', 'error');
      return;
    }

    setIsGeneratingSeo(true);
    try {
      const response = await api.post('/ai/generate-seo', {
        name: shopName.trim(),
        description: about.trim(),
      });

      if (response.data.success) {
        const { seoTitle, metaDescription, keywords } = response.data.data;
        setSeoTitle(seoTitle || '');
        setMetaDescription(metaDescription || '');
        setSeoKeywords(keywords ? keywords.join(', ') : '');
        showToast('AI SEO Metadata generated successfully!', 'success');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'AI SEO generation failed.';
      showToast(errorMsg, 'error');
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  // Call simulated AI Image Generator
  const handleAIImage = async (target: 'logo' | 'banner') => {
    if (!aiImgPrompt) {
      showToast('Please type a prompt for the AI image generator!', 'info');
      return;
    }

    setIsGeneratingImg(true);
    try {
      const response = await api.post('/ai/generate-image', {
        prompt: aiImgPrompt,
        category,
      });

      if (response.data.success) {
        const imgUrl = response.data.data.imageUrl;
        if (target === 'logo') setLogo(imgUrl);
        else setBanner(imgUrl);
        showToast('AI Image matched successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('AI Image generator failed.', 'error');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      shopName,
      category,
      about,
      logo,
      banner,
      phone,
      businessEmail,
      website,
      address,
      instagram,
      facebook,
      linkedin,
      seoTitle,
      metaDescription,
      seoKeywords: seoKeywords ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      theme: {
        primaryColor,
        secondaryColor,
        fontColor,
        font,
      },
    };

    try {
      if (isEditMode) {
        // Find by slug, but wait, backend updateShop needs ID: `PUT /api/shops/:id`
        // We need to pass the ID. To do this, let's fetch the ID of the shop we are editing.
        // Wait, does the fetchShopDetails set the shop ID in state?
        // Let's add a state for shop ID.
        // Let's fetch shop ID when fetching details:
        const slugDetailsRes = await api.get(`/shops/slug/${id}`);
        if (slugDetailsRes.data.success) {
          const shopId = slugDetailsRes.data.data._id;
          const updateRes = await api.put(`/shops/${shopId}`, payload);
          if (updateRes.data.success) {
            showToast('Shop details updated successfully!', 'success');
            navigate(`/manage-shop/${shopId}`);
          }
        }
      } else {
        const createRes = await api.post('/shops', payload);
        if (createRes.data.success) {
          showToast('New shop created successfully!', 'success');
          navigate(`/manage-shop/${createRes.data.data._id}`);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error saving shop details. Please verify your fields.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-28">
      
      {/* Pinned Header */}
      <div className="flex items-center gap-4 py-2">
        <Link 
          to="/my-shops" 
          className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition flex items-center gap-2"
        >
          <span className="text-2xl font-normal text-slate-400">←</span> {isEditMode ? 'Edit Shop Profile' : 'Create Shop Profile'}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Core Information Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">🏬</span> Core Information
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geeta Jewels"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                >
                  <option value="General">General/Others</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Fancy Items">Fancy Items</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  About Description
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={6}
                    placeholder="Handcrafted luxury jewellery inspired by traditional motifs..."
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full px-4 py-3 pb-12 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder-slate-400 resize-none"
                  />
                  <button
                    type="button"
                    onClick={handlePolishDescription}
                    disabled={isImprovingDesc}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isImprovingDesc ? 'Polishing...' : '✨ AI Polish'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Copywriter Card */}
          <div className="bg-[#0f172a] text-white p-8 rounded-2xl border border-slate-850 shadow-md space-y-6">
            <div className="space-y-1">
              <h3 className="text-white text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                <span>🤖</span> AI Assistant Copywriter
              </h3>
              <p className="text-[11px] text-slate-400">
                Need help with your brand voice? Describe your vibe and let our AI craft the perfect bio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Keywords</label>
                <input
                  type="text"
                  placeholder="Luxury, Ethically Sourced, Gold"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. Brides, Luxury collectors"
                  value={aiAudience}
                  onChange={(e) => setAiAudience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Tone</label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Professional">Sophisticated & Elegant</option>
                  <option value="Friendly">Warm & Friendly</option>
                  <option value="Luxurious">Ultra Luxurious</option>
                  <option value="Casual">Modern & Casual</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingDesc}
              onClick={handleAIDescription}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-650/20"
            >
              {isGeneratingDesc ? 'Crafting copy...' : '⚡ Generate Content'}
            </button>
          </div>

          {/* Contact Details & Links Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span>📞</span> Contact & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Public Email</label>
                <input
                  type="email"
                  placeholder="contact@geetajewels.com"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Website URL</label>
                <input
                  type="text"
                  placeholder="www.geetajewels.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Physical Store Address</label>
              <input
                type="text"
                placeholder="Shop 42, Heritage Plaza, MG Road, Mumbai, India"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Social Media Links</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs">📸</span>
                  <input
                    type="text"
                    placeholder="instagram.com/geetajewels"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs">👥</span>
                  <input
                    type="text"
                    placeholder="Facebook URL"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs">💼</span>
                  <input
                    type="text"
                    placeholder="Pinterest URL"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          
          {/* Shop Visuals Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span>🖼️</span> Shop Visuals
            </h3>

            {/* Brand Logo Upload Box */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Brand Logo</label>
              <div 
                className="relative w-full aspect-square max-w-[200px] mx-auto rounded-2xl border-2 border-dashed border-slate-200 bg-[#f6f2eb] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-slate-350"
              >
                {logo ? (
                  <div className="relative w-full h-full group">
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                      <label htmlFor="logo-upload" className="px-3 py-1.5 bg-white text-slate-800 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-slate-100">
                        Upload Logo
                      </label>
                      <button type="button" onClick={() => handleAIImage('logo')} className="text-[10px] text-white underline hover:text-indigo-200">
                        Generate with AI
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-3xl text-indigo-600">📄</span>
                    <label htmlFor="logo-upload" className="text-xs font-bold text-slate-700 mt-3 hover:text-indigo-600 cursor-pointer text-center">
                      Click to Upload
                    </label>
                    <button 
                      type="button" 
                      onClick={() => handleAIImage('logo')}
                      className="text-[10px] font-semibold text-indigo-650 hover:text-indigo-850 underline cursor-pointer mt-1"
                    >
                      Generate with AI
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                  id="logo-upload"
                />
              </div>
            </div>

            {/* Catalog Banner Upload Box */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Catalog Banner</label>
              <div className="relative w-full h-36 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center">
                {banner ? (
                  <div className="relative w-full h-full group">
                    <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                      <label htmlFor="banner-upload" className="px-3 py-1.5 bg-white text-slate-800 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-slate-100 shadow-sm">
                        Upload Banner
                      </label>
                      <button 
                        type="button" 
                        onClick={() => handleAIImage('banner')}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 shadow-sm"
                      >
                        AI Expand
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-xs font-bold text-slate-400 mb-2">No Banner Selected</span>
                    <div className="flex gap-2">
                      <label htmlFor="banner-upload" className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-slate-50">
                        Upload
                      </label>
                      <button 
                        type="button" 
                        onClick={() => handleAIImage('banner')}
                        className="px-3 py-1.5 bg-indigo-650 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-755"
                      >
                        AI Expand
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  className="hidden"
                  id="banner-upload"
                />
              </div>
            </div>

            {/* AI Prompt Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-50">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">AI Image Prompt</label>
              <input
                type="text"
                placeholder="e.g. gold necklaces with black background"
                value={aiImgPrompt}
                onChange={(e) => setAiImgPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Catalog Branding Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span>🎨</span> Catalog Branding
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Theme Colors</label>
                <div className="flex items-center gap-4 py-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-full border border-slate-250 cursor-pointer overflow-hidden"
                    />
                    <span className="text-[10px] font-mono text-slate-400">{primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-full border border-slate-250 cursor-pointer overflow-hidden"
                    />
                    <span className="text-[10px] font-mono text-slate-400">{secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-8 h-8 rounded-full border border-slate-250 cursor-pointer overflow-hidden"
                    />
                    <span className="text-[10px] font-mono text-slate-400">{fontColor}</span>
                  </div>
                </div>
              </div>

              {/* Font Family Checklist Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Theme Font</label>
                <div className="space-y-2">
                  {['Montserrat', 'Playfair Display', 'Inter', 'Outfit'].map((f) => {
                    const isSelected = font === f;
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => setFont(f)}
                        className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 font-bold'
                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span style={{ fontFamily: f }}>{f}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SEO Settings Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <button
              type="button"
              onClick={() => setShowSeoSettings(!showSeoSettings)}
              className="w-full flex justify-between items-center text-sm font-bold text-indigo-950 focus:outline-none cursor-pointer"
            >
              <span className="flex items-center gap-2">🔍 SEO Settings</span>
              <span className="text-slate-400 text-lg transition-transform duration-200" style={{ transform: showSeoSettings ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▾
              </span>
            </button>

            {showSeoSettings && (
              <div className="space-y-4 pt-4 border-t border-slate-50 animate-slide-in">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400">Configure search configurations.</p>
                  <button
                    type="button"
                    onClick={handleGenerateSeo}
                    disabled={isGeneratingSeo}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isGeneratingSeo ? 'Generating...' : '⚡ AI SEO Metadata'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">SEO Title Tag</label>
                  <input
                    type="text"
                    placeholder="Google Search Title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">SEO Meta Description</label>
                  <textarea
                    rows={3}
                    placeholder="Google Search snippet describing the shop..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Search Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. rings, gold, luxury (comma separated)"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Sticky Bottom Pinned Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-4 px-8 flex justify-between items-center shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50 animate-slide-up">
        <span className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          • Last saved 5 mins ago
        </span>
        <div className="flex items-center gap-6">
          <Link 
            to="/my-shops" 
            className="text-xs font-bold text-slate-500 hover:text-slate-700 transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#3f39cc] hover:bg-[#342eb2] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-650/15 flex items-center gap-2 cursor-pointer duration-150"
          >
            <span>✓</span> {isEditMode ? 'Save Shop Configuration' : 'Launch Shop Catalog'}
          </button>
        </div>
      </div>

    </div>
  );
}

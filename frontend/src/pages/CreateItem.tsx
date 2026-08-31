import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CreateItem() {
  const { shopId, itemId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!itemId;

  // Product Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [inventory, setInventory] = useState('10');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [imageUrl, setImageUrl] = useState('');
  
  // Array states for sizes and colors
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  // AI Assistance Parameters
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiAudience, setAiAudience] = useState('');
  const [aiTone, setAiTone] = useState('Friendly');
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

  // Tags State
  const [tagsInput, setTagsInput] = useState('');
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  // Polish State
  const [isImprovingDesc, setIsImprovingDesc] = useState(false);

  // Default option lists
  const availableSizes = ['S', 'M', 'L', 'XL', 'Free Size', 'Custom'];
  const availableColors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gold', 'Silver', 'Pink'];

  useEffect(() => {
    if (isEditMode) {
      fetchProductDetails();
    }
  }, [itemId]);

  const fetchProductDetails = async () => {
    try {
      const res = await api.get(`/products/${itemId}`);
      if (res.data.success) {
        const product = res.data.data;
        setName(product.name);
        setCategory(product.category);
        setCost(product.cost.toString());
        setDescription(product.description);
        setInventory(product.inventory.toString());
        setStatus(product.status);
        setSizes(product.sizes || []);
        setColors(product.colors || []);
        setSeoTitle(product.seoTitle || '');
        setMetaDescription(product.metaDescription || '');
        setSeoKeywords(product.seoKeywords ? product.seoKeywords.join(', ') : '');
        setTagsInput(product.tags ? product.tags.join(', ') : '');
        if (product.images && product.images[0]) {
          setImageUrl(product.images[0].imageUrl);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load product details.', 'error');
    }
  };

  // Toggle size checkbox
  const handleSizeToggle = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(prev => prev.filter(s => s !== size));
    } else {
      setSizes(prev => [...prev, size]);
    }
  };

  // Toggle color checkbox
  const handleColorToggle = (color: string) => {
    if (colors.includes(color)) {
      setColors(prev => prev.filter(c => c !== color));
    } else {
      setColors(prev => [...prev, color]);
    }
  };

  // Real File Upload to Cloudinary via Backend
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setImageUrl(res.data.url);
        showToast('Product photo uploaded successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'File upload failed.';
      showToast(errMsg, 'error');
    }
  };

  // Simulated AI description writer
  const handleAIDescription = async () => {
    // Client-side cost protection check
    if (!name.trim() || !category.trim()) {
      showToast('Form validation error: Product name and category are required before generating a description.', 'error');
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const res = await api.post('/ai/generate-description', {
        name: name.trim(),
        category: category.trim(),
        keywords: aiKeywords,
        targetAudience: aiAudience,
        tone: aiTone,
        type: 'product',
      });

      if (res.data.success) {
        const generatedText = res.data.data.description;
        
        // Typing animation effect
        setDescription('');
        let currentText = '';
        const words = generatedText.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            currentText += (i === 0 ? '' : ' ') + words[i];
            setDescription(currentText);
            i++;
          } else {
            clearInterval(interval);
            showToast('AI Product description generated!', 'success');
          }
        }, 40);

      }
    } catch (err: any) {
      console.error(err);
      showToast('AI description service failed.', 'error');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // AI Description Polisher
  const handlePolishDescription = async () => {
    if (!description || !description.trim()) {
      showToast('Form validation error: Write a draft description first before polishing.', 'error');
      return;
    }

    setIsImprovingDesc(true);
    try {
      const response = await api.post('/ai/improve-description', {
        description: description.trim(),
        tone: aiTone,
      });

      if (response.data.success) {
        const polished = response.data.data.improvedDescription;
        setDescription('');
        let currentText = '';
        const words = polished.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            currentText += (i === 0 ? '' : ' ') + words[i];
            setDescription(currentText);
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

  // AI Product Tags Generator
  const handleGenerateTags = async () => {
    if (!name || !name.trim()) {
      showToast('Form validation error: Product name is required to generate tags.', 'error');
      return;
    }
    if (!description || !description.trim()) {
      showToast('Form validation error: Product description is required to generate tags.', 'error');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const response = await api.post('/ai/generate-tags', {
        name: name.trim(),
        description: description.trim(),
      });

      if (response.data.success) {
        const generatedTags = response.data.data.tags;
        setTagsInput(generatedTags ? generatedTags.join(', ') : '');
        showToast('AI tags generated successfully!', 'success');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'AI tags generation failed.';
      showToast(errorMsg, 'error');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  // AI SEO Metadata Generator
  const handleGenerateSeo = async () => {
    if (!name || !name.trim()) {
      showToast('Form validation error: Product name is required to generate SEO metadata.', 'error');
      return;
    }
    if (!description || !description.trim()) {
      showToast('Form validation error: Describe your product first to generate relevant SEO tags.', 'error');
      return;
    }

    setIsGeneratingSeo(true);
    try {
      const response = await api.post('/ai/generate-seo', {
        name: name.trim(),
        description: description.trim(),
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

  // Simulated AI image generator matching prompt to Unsplash keywords
  const handleAIImage = async () => {
    if (!aiImgPrompt) {
      showToast('Please type a descriptive prompt first!', 'info');
      return;
    }

    setIsGeneratingImg(true);
    try {
      const res = await api.post('/ai/generate-image', {
        prompt: aiImgPrompt,
        category,
      });

      if (res.data.success) {
        setImageUrl(res.data.data.imageUrl);
        showToast('AI product image generated successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('AI image generator failed.', 'error');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      shopId,
      name,
      category,
      cost: parseFloat(cost),
      inventory: parseInt(inventory) || 0,
      description,
      sizes,
      colors,
      status,
      images: imageUrl ? [{ imageUrl, imageSource: 'upload' }] : [],
      seoTitle,
      metaDescription,
      seoKeywords: seoKeywords ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    try {
      if (isEditMode) {
        const res = await api.put(`/products/${itemId}`, payload);
        if (res.data.success) {
          showToast('Product details updated successfully!', 'success');
          navigate(`/manage-shop/${shopId}`);
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          showToast('New product added to catalog!', 'success');
          navigate(`/manage-shop/${shopId}`);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to save product details. Verify inputs.';
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
          to={`/manage-shop/${shopId}`} 
          className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition flex items-center gap-2"
        >
          <span className="text-2xl font-normal text-slate-400">←</span> {isEditMode ? 'Edit Product Item' : 'Add New Product'}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Product Specs Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span>🛍️</span> Product Specs
            </h3>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elegant Diamond Wedding Ring"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rings, Sarees"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Product Description
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={6}
                    placeholder="Provide a detailed sales pitch, highlighting materials, quality guarantees, and usage..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 pb-12 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder-slate-400 resize-none"
                  />
                  <button
                    type="button"
                    onClick={handlePolishDescription}
                    disabled={isImprovingDesc}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isImprovingDesc ? 'Polishing...' : '✨ AI Polish'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Description Generator Card */}
          <div className="bg-[#0f172a] text-white p-8 rounded-2xl border border-slate-850 shadow-md space-y-6">
            <div className="space-y-1">
              <h3 className="text-white text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                <span>🤖</span> AI Description Generator
              </h3>
              <p className="text-[11px] text-slate-400">
                Generate descriptive and converting sales pitches based on materials and tone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Keywords</label>
                <input
                  type="text"
                  placeholder="Product Keywords (e.g. silk, pure)"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Target Audience</label>
                <input
                  type="text"
                  placeholder="Target Audience (e.g. youth)"
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
                  <option value="Friendly">Friendly</option>
                  <option value="Professional">Professional</option>
                  <option value="Luxurious">Luxurious</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingDesc}
              onClick={handleAIDescription}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-650/20"
            >
              {isGeneratingDesc ? 'Writing product sheet...' : '⚡ Generate Content'}
            </button>
          </div>

          {/* Search Tags Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <span>🏷️</span> Search Tags
              </h3>
              <button
                type="button"
                onClick={handleGenerateTags}
                disabled={isGeneratingTags}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {isGeneratingTags ? 'Generating...' : '⚡ AI Tags'}
              </button>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Product Tags
              </label>
              <input
                type="text"
                placeholder="luxury, diamond, wedding (comma separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                These tags will help shoppers find this product in search and recommendations.
              </p>
            </div>
          </div>

          {/* Sizes & Colors Options Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span>📐</span> Sizes & Colors Options
            </h3>

            {/* Sizes */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => {
                  const isSelected = sizes.includes(size);
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white font-bold'
                          : 'border-slate-100 bg-slate-50 text-slate-650 hover:border-slate-350'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Available Colors</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(color => {
                  const isSelected = colors.includes(color);
                  return (
                    <button
                      type="button"
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-650 text-white font-bold'
                          : 'border-slate-100 bg-slate-50 text-slate-650 hover:border-slate-355'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          
          {/* Visibility Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">Visibility Status</h3>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Catalog Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="active">Active (Visible Publicly)</option>
                <option value="draft">Draft (Merchant View Only)</option>
                <option value="archived">Archived (Closed)</option>
              </select>
            </div>
          </div>

          {/* Product Photo Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span>🖼️</span> Product Photo
            </h3>

            <div className="space-y-2">
              <div 
                className="relative w-full aspect-square max-w-[200px] mx-auto rounded-2xl border-2 border-dashed border-slate-200 bg-[#f6f2eb] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-slate-350"
              >
                {imageUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={imageUrl} alt="Product preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                      <label htmlFor="prod-upload" className="px-3 py-1.5 bg-white text-slate-800 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-slate-100">
                        Upload Photo
                      </label>
                      <button type="button" onClick={handleAIImage} className="text-[10px] text-white underline hover:text-indigo-200">
                        Generate with AI
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-3xl text-indigo-600">📄</span>
                    <label htmlFor="prod-upload" className="text-xs font-bold text-slate-700 mt-3 hover:text-indigo-600 cursor-pointer text-center">
                      Click to Upload
                    </label>
                    <button 
                      type="button" 
                      onClick={handleAIImage}
                      className="text-[10px] font-semibold text-indigo-650 hover:text-indigo-850 underline cursor-pointer mt-1"
                    >
                      Generate with AI
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="prod-upload"
                />
              </div>
            </div>

            {/* AI Prompt Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-50">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">AI Image Prompt</label>
              <input
                type="text"
                placeholder="e.g. red run shoe with reflections"
                value={aiImgPrompt}
                onChange={(e) => setAiImgPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
              <p className="text-[9px] text-slate-400 leading-normal">
                Type details and click 'Generate with AI' to search high definition studio photography.
              </p>
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
                  <p className="text-[10px] text-slate-450">Configure search configurations.</p>
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
                    placeholder="Google Search snippet describing this product..."
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
          • Last saved recently
        </span>
        <div className="flex items-center gap-6">
          <Link 
            to={`/manage-shop/${shopId}`}
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
            <span>✓</span> {isEditMode ? 'Save Product Details' : 'Add Product to Catalog'}
          </button>
        </div>
      </div>

    </div>
  );
}


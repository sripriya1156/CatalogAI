import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // State for FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. Header (Navbar) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent tracking-tight">
            CatalogAI
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#workflow" className="hover:text-indigo-600 transition">Workflow</a>
            <a href="#luxury" className="hover:text-indigo-600 transition">Showcase</a>
            <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition shadow-md hover:shadow-lg">
            Get Started
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
        {/* Soft decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-200/40 rounded-full filter blur-3xl -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          New: AI Writer Generation 2.0 Active
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Build Your Product Catalog in <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Minutes</span> with AI
        </h1>

        {/* Subheading */}
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create beautiful online catalogs, generate professional product descriptions, and enhance images powered by industry leading machine learning.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-800 text-white font-extrabold rounded-full transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-150">
            Start Building Free
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 font-extrabold rounded-full transition shadow-sm hover:shadow flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Explore Features
          </a>
        </div>

        {/* Mockup Frame (CSS-based iMac-style rendering) */}
        <div className="relative border-4 border-slate-800 bg-slate-900 rounded-3xl p-2 shadow-2xl max-w-4xl mx-auto">
          {/* Inner Screen */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-[16/10] border border-slate-850 flex flex-col text-left text-xs text-slate-400">
            {/* Window Header */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </div>
              <div className="bg-slate-950/80 px-10 py-1 rounded-md text-[10px] text-slate-500 border border-slate-800">
                catalogai.com/shop/priya-sarees
              </div>
              <span className="w-4"></span>
            </div>
            
            {/* Fake Dashboard Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <aside className="w-48 bg-slate-900/40 p-4 border-r border-slate-800 hidden sm:block">
                <div className="w-8 h-8 rounded bg-gradient-to-r from-indigo-500 to-blue-500 mb-6"></div>
                <ul className="space-y-4">
                  <li className="w-2/3 h-2 bg-indigo-500/30 rounded"></li>
                  <li className="w-3/4 h-2 bg-slate-800 rounded"></li>
                  <li className="w-1/2 h-2 bg-slate-800 rounded"></li>
                  <li className="w-2/3 h-2 bg-slate-800 rounded"></li>
                </ul>
              </aside>
              {/* Main Workspace Area */}
              <main className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white text-base font-bold">Priya Sarees</h3>
                    <p className="text-[10px] text-slate-500">Premium silk and designer apparel</p>
                  </div>
                  <span className="px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                    Active Catalog
                  </span>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {['Total Items', 'Catalog Views', 'Link Clicks'].map((label, i) => (
                    <div key={label} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
                      <p className="text-white text-lg font-bold">{[48, '1,240', 145][i]}</p>
                    </div>
                  ))}
                </div>

                {/* Simulated Table */}
                <div className="bg-slate-900/20 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-900/40 px-4 py-3 border-b border-slate-800 text-[10px] font-bold text-slate-400 flex justify-between">
                    <span>ITEM DETAIL</span>
                    <span>STATUS</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {['Kanchipuram Silk Saree', 'Banarasi Brocade Saree'].map((item, index) => (
                      <div key={item} className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-600 font-bold">
                            IMG
                          </div>
                          <div>
                            <p className="text-white font-semibold">{item}</p>
                            <p className="text-[9px] text-slate-500">ITEM-7A2F3{index}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Intelligent Suite for Modern Commerce
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Everything you need to optimize your product management workflow and launch stunning catalog websites.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Writing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate SEO-optimized product descriptions that convert visitors into customers instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Visual AI</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically remove backgrounds and upscale product images to high-fidelity studio quality.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Stock Sync</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Intelligently track inventory levels and sync status across all your online catalog pages.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Insights</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Predict which products will perform best based on historical view and click analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Split Feature Detail Section (Dark Section) */}
      <section className="py-20 px-6 bg-[#0B0F19] text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text */}
          <div className="space-y-6">
            <span className="px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              AI Media Generator
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              From Raw Data to Professional Content
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Our robust AI features enhance your product description and generate pristine, conversion-focused copy and high-fidelity visuals instantly.
            </p>
            <ul className="space-y-4 pt-2">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-350 text-sm">100% accuracy with real-time generative models</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-350 text-sm">Active updates to output quality for content consistency</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Visual Widgets */}
          <div className="space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
            {/* Image Enhancer Comparison Slider Widget */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/10]">
              <div className="absolute inset-0 flex">
                {/* Left Side (Raw/Before) */}
                <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 relative">
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
                    Raw Image
                  </span>
                  {/* Flat representation of a raw shoe */}
                  <div className="w-24 h-24 rounded bg-slate-850 opacity-40 flex items-center justify-center text-[10px] text-slate-500">
                    Raw Shoe Photo
                  </div>
                </div>

                {/* Divider */}
                <div className="w-1 bg-indigo-500 relative z-10">
                  <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg cursor-pointer">
                    ↔
                  </span>
                </div>

                {/* Right Side (Enhanced/After) */}
                <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 relative">
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    AI Enhanced
                  </span>
                  {/* Glowing enhanced studio product visual representation */}
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 filter blur-xl absolute"></div>
                  <div className="w-24 h-24 rounded-xl border border-indigo-500/20 bg-gradient-to-tr from-indigo-900/40 to-blue-900/40 flex items-center justify-center text-xs text-indigo-300 font-bold relative z-10 shadow-2xl">
                    Studio Shoe
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prompt Input & Output Display */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] space-y-3">
              <div>
                <p className="text-slate-500 font-semibold mb-1 uppercase tracking-widest">AI Image Prompter</p>
                <div className="w-full bg-slate-900 px-3 py-2 rounded border border-slate-800 text-slate-350">
                  "Luxury studio photograph of sleek red running shoe with glowing cyan backlight..."
                </div>
              </div>
              <div>
                <p className="text-indigo-400 font-semibold mb-1 uppercase tracking-widest">AI Description Result</p>
                <div className="w-full bg-indigo-950/20 px-3 py-2 rounded border border-indigo-900/20 text-slate-300 leading-relaxed">
                  "Experience ultimate performance with the sports running shoe. Crafted with premium breathable fabrics and a responsive sole, it maximizes acceleration and support for everyday athletes."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. A Streamlined Workflow (Timeline) */}
      <section id="workflow" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              A Streamlined Workflow
            </h2>
            <p className="text-slate-600 leading-relaxed">
              From uploading your assets to sharing with your clients in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: '1', title: 'Upload Data', desc: 'Import your product details or raw product images effortlessly.' },
              { step: '2', title: 'AI Generation', desc: 'Our engine produces descriptions, tags, and intelligent search tags.' },
              { step: '3', title: 'Visual Polish', desc: 'AI enhances your pictures with studio-consistent backgrounds.' },
              { step: '4', title: 'Go Live', desc: 'Publish to your catalog webpage with a single click. Instant sharing.' },
            ].map((s) => (
              <div key={s.step} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:border-indigo-200 transition">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-extrabold mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Deliver a Luxury Shopping Experience */}
      <section id="luxury" className="py-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Deliver a Luxury Shopping Experience
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Don't just list products—showcase them. Premium responsive layouts ensure every client views your catalog like a luxury boutique collection.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Modern Layouts</h4>
                <p className="text-slate-600 text-xs">Tailored to fit your brand identity.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Fast Performance</h4>
                <p className="text-slate-600 text-xs">Instant load times on all screens.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Card Mockup */}
          <div className="bg-gradient-to-tr from-indigo-50 to-blue-50 p-8 rounded-3xl border border-indigo-100/50 flex justify-center">
            {/* The Bag Card */}
            <div className="w-80 bg-white rounded-2xl border border-slate-150 shadow-xl overflow-hidden">
              <div className="bg-slate-50 aspect-square flex items-center justify-center p-8 relative">
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600 uppercase tracking-widest">
                  Featured
                </span>
                {/* Simulated high quality image container */}
                <div className="w-36 h-36 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400 font-bold border border-slate-300/30 shadow-inner">
                  Bag Photo
                </div>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Leather Goods</p>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Siena Leather Tote</h3>
                  <p className="text-base font-bold text-indigo-600">$2,450</p>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Handcrafted from premium full-grain Italian calf leather. Features gold-finish hardware.
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-semibold text-slate-600">Handcrafted</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-semibold text-slate-600">Limited Edition</span>
                </div>
                <button className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition">
                  Active Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section id="faq" className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How accurate is the AI description generator?',
                a: 'Highly accurate. The description writer utilizes fine-tuned language models optimized specifically for commerce. You can review and refine every generated copy inside your item manager.',
              },
              {
                q: 'Can I customize the themes of my catalog page?',
                a: 'Yes. Every merchant can customize colors, fonts, and banners from their Shop Settings panel, which compiles live CSS overrides.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, our Free Plan supports up to 10 product items and standard AI description generations with no credit card required.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 flex items-center justify-between font-bold text-slate-900 text-left hover:bg-slate-50 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-normal text-lg">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-slate-950 to-slate-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Ambient glow backgrounds */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl -z-10" />
          
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Start Building Your Catalog Today
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Join forward-thinking merchants who are saving thousands of hours with AI-driven product management.
          </p>
          <Link to="/register" className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold rounded-full transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-150">
            Get Started Free
          </Link>
          
          <div className="mt-8 flex items-center justify-center gap-3">
            {/* Avatars */}
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold">SP</span>
              <span className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold">JD</span>
              <span className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold">AS</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Trusted by 2,000+ developers & owners
            </p>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">CatalogAI</h3>
            <p className="text-xs leading-relaxed max-w-xs">
              Premium AI catalog platform for the next generation of commerce.
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} CatalogAI. All rights reserved.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#workflow" className="hover:text-white transition">Workflow</a></li>
              <li><span className="text-slate-600">Integrations (Soon)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-600">About Us</span></li>
              <li><span className="text-slate-600">Careers</span></li>
              <li><span className="text-slate-600">Privacy Policy</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Contact</h4>
            <p className="text-xs mb-2">support@catalogai.com</p>
            <div className="flex gap-4">
              {/* Fake Social Icons */}
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] hover:text-white cursor-pointer">𝕏</span>
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] hover:text-white cursor-pointer">in</span>
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] hover:text-white cursor-pointer">f</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Search, Filter, Play, Image as ImageIcon, Video, Layers, X, Sparkles, Film, Eye } from 'lucide-react';
import { GalleryItem } from '../types.js';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
}

export default function GallerySection({ galleryItems }: GallerySectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Extract unique categories from actual items
  const categories = useMemo(() => {
    const list = new Set(galleryItems.map(item => item.category));
    return ['All', ...Array.from(list)];
  }, [galleryItems]);

  const mediaTypes = ['All', 'image', 'video', 'shorts', 'reels'];

  // Filter gallery items based on selections
  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesType = selectedType === 'All' || item.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [galleryItems, searchQuery, selectedCategory, selectedType]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-100" id="gallery-page">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Astrology Celestial Gallery
        </h1>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
          Explore Vedic spiritual alignments, planetary transitions visualizers, Vastu correction layouts, and holy ritual reels curated directly by Acharya Shastri.
        </p>
      </div>

      {/* Filters & Search Controls Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search celestial media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/40 focus:outline-none"
              id="gallery-search-input"
            />
          </div>

          {/* Formats Tabs */}
          <div className="flex flex-wrap gap-1.5" id="gallery-type-filters">
            {mediaTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all duration-150 ${
                  selectedType === type
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {type === 'All' ? 'All Formats' : type}
              </button>
            ))}
          </div>

        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-800/60" id="gallery-category-filters">
          <span className="text-xs text-slate-500 self-center mr-1 flex items-center gap-1.5">
            <Filter className="h-3 w-3" />
            <span>Categories:</span>
          </span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  : 'bg-slate-950/40 border border-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl" id="gallery-empty-state">
          <Layers className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">No celestial media found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or checking another category format filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" id="gallery-grid">
          {filteredItems.map((item) => {
            const isVideoFormat = item.type === 'video' || item.type === 'shorts' || item.type === 'reels';
            return (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all duration-300 flex flex-col justify-between"
                id={`gallery-item-${item.id}`}
              >
                {/* Media Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  {isVideoFormat ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      {/* Video Thumbnail block */}
                      <img 
                        src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80" 
                        alt={item.title} 
                        className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-md group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 fill-slate-950 ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 rounded-full bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider backdrop-blur-sm">
                    {item.category}
                  </div>

                  {/* Format icon Pill */}
                  <div className="absolute top-3 right-3 rounded-full bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider backdrop-blur-sm flex items-center space-x-1">
                    {item.type === 'image' && <ImageIcon className="h-3 w-3 text-amber-400" />}
                    {(item.type === 'video' || item.type === 'reels' || item.type === 'shorts') && <Film className="h-3 w-3 text-amber-400" />}
                    <span>{item.type}</span>
                  </div>

                  {/* Eye Icon Hover effect overlay */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="rounded-full bg-slate-950/80 p-2.5 border border-slate-800">
                      <Eye className="h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                </div>

                {/* Content info info */}
                <div className="p-4 border-t border-slate-950">
                  <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  <div className="text-[10px] text-slate-500 mt-3">
                    Uploaded: {item.uploadDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Immersive Lightbox Media Preview Modal */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-fade-in"
          id="gallery-lightbox"
        >
          <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-900/80 p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              id="btn-lightbox-close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Immersive Viewer Box */}
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {previewItem.type === 'image' ? (
                <img
                  src={previewItem.mediaUrl}
                  alt={previewItem.title}
                  className="max-h-[70vh] w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <video
                  src={previewItem.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full object-contain"
                />
              )}
            </div>

            {/* Content Details Block */}
            <div className="p-6 bg-slate-950 border-t border-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    {previewItem.category} • {previewItem.type}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2 flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span>{previewItem.title}</span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {previewItem.description}
                  </p>
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap pt-1">
                  Published on: {previewItem.uploadDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

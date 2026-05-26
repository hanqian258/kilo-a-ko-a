import React, { memo } from 'react';
import { CoralImage } from '../../types';
import { MapPin, ChevronRight, Edit2, Trash2, CheckSquare, Square } from 'lucide-react';

interface GalleryGridProps {
  images: CoralImage[];
  isDark: boolean;
  canManage: boolean;
  onEdit: (e: React.MouseEvent, img: CoralImage) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onSelect: (img: CoralImage) => void;
  selectedIds?: string[];
  onToggleSelected?: (id: string) => void;
}

export const GalleryGrid = memo(({ images, isDark, canManage, onEdit, onDelete, onSelect, selectedIds = [], onToggleSelected }: GalleryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-16">
      {images.map((img) => (
        <article
          key={img.id}
          onClick={() => onSelect(img)}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${img.scientificName || 'Coral observation'}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(img);
            }
          }}
          className={`min-h-[460px] flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-500 hover:-translate-y-2 cursor-pointer group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 ${
            isDark
              ? 'bg-[#0c1218] border-white/5 hover:border-teal-500/30'
              : 'bg-white border-slate-100 hover:border-teal-500/20 shadow-slate-200'
          }`}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 shrink-0">
            <img
              src={img.url}
              alt={img.scientificName || 'Coral observation'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
              onError={(e) => {
                console.error('[Gallery] Image failed to load:', img.url);
                e.currentTarget.style.opacity = '0.25';
              }}
            />
            <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl text-white text-[10px] px-4 py-2 rounded-full flex items-center gap-2 font-black uppercase tracking-widest border border-white/10">
              <MapPin size={12} className="text-teal-400" /> {img.location}
            </div>

            {canManage && (
              <div className="absolute top-5 right-5 flex gap-2">
                {onToggleSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelected(img.id);
                    }}
                    className="bg-white/90 hover:bg-white p-2 rounded-xl text-slate-700 shadow-xl transition-all"
                    title={selectedIds.includes(img.id) ? 'Deselect observation' : 'Select observation'}
                    aria-label={selectedIds.includes(img.id) ? 'Deselect observation' : 'Select observation'}
                  >
                    {selectedIds.includes(img.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(e, img);
                  }}
                  className="bg-white/90 hover:bg-white p-2 rounded-xl text-teal-600 shadow-xl transition-all"
                  title={`Edit ${img.scientificName || 'Coral observation'}`}
                  aria-label={`Edit ${img.scientificName || 'Coral observation'}`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(e, img.id);
                  }}
                  className="bg-white/90 hover:bg-white p-2 rounded-xl text-red-500 shadow-xl transition-all"
                  title={`Delete ${img.scientificName || 'Coral observation'}`}
                  aria-label={`Delete ${img.scientificName || 'Coral observation'}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
              <span className="text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 translate-y-4 group-hover:translate-y-0 transition-transform">
                View Growth Journal <ChevronRight size={14} className="text-teal-400" />
              </span>
            </div>
          </div>

          <div className="p-8 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`font-black text-xl italic font-serif tracking-tight leading-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-teal-600'}`}>
                  {img.scientificName || 'Community Observation'}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">
                  {img.date || 'Recent'} &bull; {img.uploaderName}
                </p>
              </div>
            </div>
            <p className={`text-sm leading-relaxed line-clamp-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {img.description || "Community coral monitoring photo from Kahalu'u Bay."}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
});

GalleryGrid.displayName = 'GalleryGrid';

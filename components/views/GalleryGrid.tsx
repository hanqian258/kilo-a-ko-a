import React, { memo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { CoralImage } from '../../types';
import { MapPin, ChevronRight, Edit2, Trash2 } from 'lucide-react';

interface GalleryGridProps {
  images: CoralImage[];
  isDark: boolean;
  canManage: boolean;
  onEdit: (e: React.MouseEvent, img: CoralImage) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onSelect: (img: CoralImage) => void;
}

interface ItemData {
  images: CoralImage[];
  onSelect: (img: CoralImage) => void;
  isDark: boolean;
  canManage: boolean;
  onEdit: (e: React.MouseEvent, img: CoralImage) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  columnCount: number;
  padding: number;
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: ItemData;
}

const Cell = ({ columnIndex, rowIndex, style, data }: CellProps) => {
  const { images, columnCount, padding, onSelect, isDark, canManage, onEdit, onDelete } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= images.length) return null;
  const img = images[index];

  return (
    <div style={{
      ...style,
      left: (style.left as number),
      top: (style.top as number),
      width: style.width,
      height: style.height,
      padding: padding
    }}>
      <div
        key={img.id}
        onClick={() => onSelect(img)}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${img.scientificName || "Coral observation"}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(img);
          }
        }}
        className={`h-full flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-500 hover:-translate-y-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 ${isDark ? 'bg-[#0c1218] border-white/5 hover:border-teal-500/30' : 'bg-white border-slate-100 hover:border-teal-500/20 shadow-slate-200'}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 shrink-0">
          <img src={img.url} alt={img.scientificName || "Coral"} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
          <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl text-white text-[10px] px-4 py-2 rounded-full flex items-center gap-2 font-black uppercase tracking-widest border border-white/10">
            <MapPin size={12} className="text-teal-400" /> {img.location}
          </div>

          {canManage && (
            <div className="absolute top-5 right-5 flex gap-2">
              <button
                type="button"
                aria-label={`Edit ${img.scientificName || "item"}`}
                title="Edit Image"
                onClick={(e) => onEdit(e, img)}
                className="bg-white/90 hover:bg-white p-2 rounded-xl text-teal-600 shadow-xl transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                aria-label={`Delete ${img.scientificName || "item"}`}
                title="Delete Image"
                onClick={(e) => onDelete(e, img.id)}
                className="bg-white/90 hover:bg-white p-2 rounded-xl text-red-500 shadow-xl transition-all"
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
               <h3 className={`font-black text-xl italic font-serif tracking-tight leading-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-teal-600'}`}>{img.scientificName || "Community Observation"}</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">{img.date} • {img.uploaderName}</p>
            </div>
          </div>
          <p className={`text-sm leading-relaxed line-clamp-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {img.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const GalleryGrid = memo(({ images, isDark, canManage, onEdit, onDelete, onSelect }: GalleryGridProps) => {
  return (
    <div className="flex-1" style={{ height: '80vh', minHeight: '600px' }}>
        {/* @ts-expect-error: React 19 type mismatch with react-virtualized-auto-sizer children prop */}
        <AutoSizer>
          {({ height, width }) => {
            const getColumnCount = (w: number) => {
              if (w < 640) return 1;
              if (w < 1024) return 2;
              return 3;
            };

            const columnCount = getColumnCount(width);
            const gap = 40;
            const padding = 20; // Half gap for padding around cells
            const columnWidth = width / columnCount;

            // Calculate row height dynamically
            // Item width (content area) = columnWidth - gap
            // Image is 4/3 aspect ratio
            const itemContentWidth = columnWidth - gap;
            const imageHeight = itemContentWidth * (3/4);
            const textContentHeight = 250; // Estimate for text area (p-8 * 2 + text)
            const rowHeight = imageHeight + textContentHeight;

            const itemData: ItemData = {
              images,
              onSelect,
              isDark,
              canManage,
              onEdit,
              onDelete,
              columnCount,
              padding
            };

            return (
              <Grid
                columnCount={columnCount}
                columnWidth={columnWidth}
                height={height}
                rowCount={Math.ceil(images.length / columnCount)}
                rowHeight={rowHeight}
                width={width}
                className="-m-5" // Compensate for cell padding
                itemData={itemData}
              >
                {Cell}
              </Grid>
            );
          }}
        </AutoSizer>
    </div>
  );
});

GalleryGrid.displayName = 'GalleryGrid';

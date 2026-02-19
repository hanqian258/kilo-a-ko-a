import React, { useState, useEffect, useCallback } from 'react';
import { User, CoralImage, UserRole, CoralMilestone } from '../../types';
import { Button } from '../Button';
import { compressImage } from '../../utils/imageProcessor';
import { Camera, Upload, MapPin, X, Sparkles, Microscope, Send, Activity, ShieldAlert, HeartPulse, BookOpen } from 'lucide-react';
import { subscribeToGallery, saveGalleryImage, deleteGalleryImage } from '../../utils/galleryService';
import { GalleryGrid } from './GalleryGrid';

interface GalleryViewProps {
  user: User | null;
  theme: 'light' | 'dark';
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    images: CoralImage[];
    setSelectedCoral: (img: CoralImage) => void;
    isDark: boolean;
    isAdmin: boolean;
    handleEditClick: (e: React.MouseEvent, img: CoralImage) => void;
    handleDelete: (e: React.MouseEvent, id: string) => void;
    columnCount: number;
    padding: number;
  };
}

const Cell = ({ columnIndex, rowIndex, style, data }: CellProps) => {
  const { images, columnCount, padding, setSelectedCoral, isDark, isAdmin, handleEditClick, handleDelete } = data;
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
        onClick={() => setSelectedCoral(img)}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${img.scientificName || "Coral observation"}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedCoral(img);
          }
        }}
        className={`h-full flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-500 hover:-translate-y-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 ${isDark ? 'bg-[#0c1218] border-white/5 hover:border-teal-500/30' : 'bg-white border-slate-100 hover:border-teal-500/20 shadow-slate-200'}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 shrink-0">
          <img src={img.url} alt={img.scientificName || "Coral"} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
          <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl text-white text-[10px] px-4 py-2 rounded-full flex items-center gap-2 font-black uppercase tracking-widest border border-white/10">
            <MapPin size={12} className="text-teal-400" /> {img.location}
          </div>

          {isAdmin && (
            <div className="absolute top-5 right-5 flex gap-2">
              <button aria-label={`Edit ${img.scientificName || "item"}`} onClick={(e) => handleEditClick(e, img)} className="bg-white/90 hover:bg-white p-2 rounded-xl text-teal-600 shadow-xl transition-all"><Edit2 size={16} /></button>
              <button aria-label={`Delete ${img.scientificName || "item"}`} onClick={(e) => handleDelete(e, img.id)} className="bg-white/90 hover:bg-white p-2 rounded-xl text-red-500 shadow-xl transition-all"><Trash2 size={16} /></button>
              <button onClick={(e) => handleEditClick(e, img)} className="bg-white/90 hover:bg-white p-2 rounded-xl text-teal-600 shadow-xl transition-all" aria-label={`Edit ${img.scientificName || "image"}`} title="Edit Image"><Edit2 size={16} /></button>
              <button onClick={(e) => handleDelete(e, img.id)} className="bg-white/90 hover:bg-white p-2 rounded-xl text-red-500 shadow-xl transition-all" aria-label={`Delete ${img.scientificName || "image"}`} title="Delete Image"><Trash2 size={16} /></button>
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

export const GalleryView: React.FC<GalleryViewProps> = ({ user, theme }) => {
  const [images, setImages] = useState<CoralImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [description, setDescription] = useState<string>('');
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [selectedCoral, setSelectedCoral] = useState<CoralImage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDark = theme === 'dark';
  const isAdmin = user?.role === UserRole.ADMIN;
  const isScientist = user?.role === UserRole.SCIENTIST;
  const canManage = isAdmin || isScientist;

  useEffect(() => {
    const unsubscribe = subscribeToGallery((fetchedImages) => {
      setImages(fetchedImages);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      try {
        const compressed = await compressImage(file);
        setPreviewUrl(compressed);
      } catch (error) {
        console.error("Image processing error:", error);
      }
    }
  };

  const handleEditClick = useCallback((e: React.MouseEvent, img: CoralImage) => {
    e.stopPropagation();
    setEditingItemId(img.id);
    setLocation(img.location);
    setScientificName(img.scientificName || '');
    setDescription(img.description);
    setPreviewUrl(img.url);
    setIsUploading(true);
  }, []);

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this monitoring record?")) {
      try {
        await deleteGalleryImage(id);
      } catch (error) {
        console.error("Failed to delete image", error);
        alert("Failed to delete image.");
      }
    }
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    setIsSaving(true);
    let imageToSave: CoralImage;

    if (editingItemId) {
      const existing = images.find(img => img.id === editingItemId);
      if (!existing) return;

      imageToSave = {
        ...existing,
        location,
        scientificName,
        description: description,
        url: previewUrl
      };
    } else {
      imageToSave = {
        id: Date.now().toString(),
        url: previewUrl,
        uploaderName: user?.name || 'Reef Steward',
        date: new Date().toISOString().split('T')[0],
        location: location || 'Kahalu‘u',
        scientificName: scientificName || 'Pocillopora',
        description: description || 'Community monitoring update.',
        milestones: [
          { id: `m-${Date.now()}`, date: new Date().toISOString().split('T')[0], title: 'Observation Logged', description: 'New community data point added to monitoring series.', status: 'healthy', imageUrl: previewUrl }
        ],
        userId: user?.id // Add userId
      };
    }

    try {
      await saveGalleryImage(imageToSave);
      setIsUploading(false);
      resetForm();
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 5000);
    } catch (error) {
      console.error("Failed to save image", error);
      alert("Failed to save image.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setEditingItemId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setLocation('');
    setScientificName('');
    setDescription('');
  };

  const MilestoneStatusBadge = ({ status }: { status: CoralMilestone['status'] }) => {
    const config = {
      healthy: { icon: Activity, text: 'Healthy Growth', color: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700' },
      warning: { icon: ShieldAlert, text: 'Active Monitoring', color: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700' },
      recovery: { icon: HeartPulse, text: 'Recovery Phase', color: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700' }
    };
    const { icon: Icon, text, color } = config[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${color} border border-white/5`}>
        <Icon size={12} /> {text}
      </span>
    );
  };

  return (
    <div className="relative">
      {showNotificationToast && (
        <div className={`fixed top-24 right-6 z-[120] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-300 border ${isDark ? 'bg-black text-white border-teal-500/20' : 'bg-white text-slate-900 border-slate-200'}`}>
          <div className="bg-teal-500 p-2 rounded-full shadow-lg shadow-teal-500/20 text-white">
            <Send size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">{editingItemId ? 'Record Updated!' : 'Update Dispatched!'}</p>
            <p className="text-[10px] opacity-60 uppercase tracking-widest">Notification sent to community stewards</p>
          </div>
          <button type="button" aria-label="Dismiss notification" title="Dismiss" onClick={() => setShowNotificationToast(false)} className="ml-2 text-slate-400 hover:text-teal-500">
            <X size={16} />
          </button>
        </div>
      )}

      {selectedCoral && (
        <div className={`fixed inset-0 z-[130] overflow-y-auto animate-in fade-in duration-500 transition-colors ${isDark ? 'bg-[#05080a]' : 'bg-slate-100'}`}>
          {/* Mist Texture Background */}
          <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.3),transparent_70%)]"></div>
          
          <div className="container relative z-10 mx-auto px-4 py-12 max-w-4xl">
            <div className="flex justify-between items-center mb-12">
               <button 
                 type="button"
                 title="Close details view"
                 onClick={() => setSelectedCoral(null)}
                 className={`flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all px-5 py-2.5 rounded-full border backdrop-blur-xl ${
                   isDark 
                    ? 'text-white/40 hover:text-white bg-white/5 border-white/10 hover:bg-white/10' 
                    : 'text-slate-500 hover:text-slate-900 bg-white/40 border-slate-200 hover:bg-white/60 shadow-sm'
                 }`}
               >
                 <X size={16} /> Back to Gallery
               </button>
               <div className="flex items-center gap-3 text-teal-500">
                  <BookOpen size={20} />
                  <span className="font-black uppercase tracking-[0.3em] text-[10px]">Growth Journal</span>
               </div>
            </div>

            <header className="text-center mb-24 space-y-6">
              <h2 className={`text-6xl md:text-8xl font-black italic font-serif tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedCoral.scientificName || "Coastal Observation"}
              </h2>
              <div className="flex items-center justify-center gap-5">
                <p className="text-teal-500 font-bold tracking-[0.2em] uppercase text-xs flex items-center gap-2">
                   <MapPin size={14} /> {selectedCoral.location}
                </p>
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-300'}`}></div>
                <p className={`font-bold tracking-[0.2em] uppercase text-xs ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
                   Monitoring Series
                </p>
              </div>
            </header>

            <div className="space-y-40 pb-40">
              {(selectedCoral.milestones || []).map((milestone, index) => (
                <section 
                  key={milestone.id} 
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-16 items-center animate-in fade-in slide-in-from-bottom-20 duration-1000`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-full md:w-1/2 group">
                    <div className={`relative aspect-[4/3] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 transition-all duration-700 group-hover:scale-[1.02] group-hover:border-teal-500/20 ${
                      isDark ? 'border-white/5 bg-slate-900' : 'border-white bg-white shadow-slate-300/50'
                    }`}>
                       <img 
                         src={milestone.imageUrl || selectedCoral.url} 
                         alt={milestone.title} 
                         className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                       />
                       <div className="absolute top-8 left-8 bg-black/70 backdrop-blur-xl text-white px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
                          <p className="text-[11px] font-black uppercase tracking-[0.3em]">{milestone.date}</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2 space-y-8">
                    <div className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-500 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 shadow-black' 
                        : 'bg-white/30 border-white/60 shadow-xl shadow-slate-200/50'
                    }`}>
                      <div className="flex flex-col gap-4 mb-6">
                        <div className="w-fit"><MilestoneStatusBadge status={milestone.status} /></div>
                        <h3 className={`text-4xl font-black tracking-tight leading-[1.1] font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {milestone.title}
                        </h3>
                      </div>
                      <p className={`text-xl leading-relaxed font-medium italic border-l-4 border-teal-500/20 pl-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        "{milestone.description}"
                      </p>
                    </div>
                    
                    <div className={`pt-8 flex items-center gap-4 ${isDark ? 'text-white/5' : 'text-slate-200'}`}>
                       <div className="h-px flex-grow bg-current"></div>
                       <Sparkles size={24} className="opacity-20" />
                       <div className="h-px flex-grow bg-current"></div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <footer className={`text-center pt-32 border-t ${isDark ? 'border-white/5' : 'border-slate-300/50'}`}>
               <div className="max-w-md mx-auto space-y-6">
                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                    isDark ? 'bg-teal-500/5 text-teal-500/60 border-teal-500/10' : 'bg-teal-500/10 text-teal-600 border-teal-200 shadow-sm'
                  }`}>
                     Journal complete for current cycle
                  </div>
                  <p className={`text-xs font-medium leading-relaxed uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
                     Every entry represents a step toward a more resilient reef ecosystem at {selectedCoral.location}.
                  </p>
               </div>
            </footer>
          </div>
        </div>
      )}

      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b pb-8 gap-6 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="space-y-2">
          <h2 className={`text-4xl font-black tracking-tight font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Nānā Kahaluʻu Monitoring</h2>
          <p className={`flex items-center gap-3 text-lg ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            <Microscope size={22} className="text-teal-500" />
            Integrating Hawaiian and Western scientific methodologies to guide reef protection.
          </p>
        </div>
        
        {canManage && !isUploading && (
          <Button onClick={() => { resetForm(); setIsUploading(true); }} className="flex items-center gap-3 shadow-2xl h-14 px-8 text-lg font-black uppercase tracking-widest rounded-2xl">
            <Camera size={20} /> Community Observation
          </Button>
        )}
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border transition-colors duration-500 animate-in zoom-in-95 ${isDark ? 'bg-[#0c1218] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`p-10 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div>
                <h3 className={`text-3xl font-black tracking-tight italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingItemId ? 'Manage Observation' : 'New Observation'}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Steward: {user?.name}</p>
              </div>
              <button type="button" aria-label="Close upload form" title="Close" onClick={() => { setIsUploading(false); resetForm(); }} className="text-slate-400 hover:text-teal-500 p-2 transition-colors">
                <X size={32} />
              </button>
            </div>
            
            <div className="p-10">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-1/2">
                  <div className={`group relative border-2 border-dashed rounded-[2.5rem] h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${previewUrl ? 'border-teal-500/50 bg-teal-500/5 shadow-2xl shadow-teal-500/10' : (isDark ? 'border-white/10 hover:border-teal-500/30 hover:bg-white/5' : 'border-slate-200 hover:border-teal-500/30 hover:bg-slate-50')}`}>
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer relative z-10">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-3 transition-opacity group-hover:opacity-20" />
                          <div className="flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Upload size={40} className="text-teal-500 mb-2" />
                            <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>Replace Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload size={56} className="text-slate-300 mb-4 opacity-50" />
                          <span className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Select Image</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <form onSubmit={handleUploadSubmit} className="w-full lg:w-1/2 flex flex-col gap-6">
                   <div>
                    <label htmlFor="scientific-name" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Scientific Name</label>
                    <input 
                      id="scientific-name"
                      type="text" 
                      placeholder="e.g. Pocillopora meandrina" 
                      className={`w-full p-5 border rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      value={scientificName}
                      onChange={(e) => setScientificName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="coastal-site" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Coastal Site</label>
                    <input 
                      id="coastal-site"
                      type="text" 
                      placeholder="e.g. Kahalu‘u Bay South" 
                      className={`w-full p-5 border rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="observation-notes" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Observation Notes</label>
                    <textarea 
                      id="observation-notes"
                      className={`w-full p-5 border rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium h-48 resize-none ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Species identified, bleaching status, or unusual sightings..."
                    />
                  </div>

                  <div className="mt-auto pt-6 flex gap-4">
                    <Button type="button" variant="outline" className={`flex-1 h-14 rounded-2xl ${isDark ? 'border-white/10 text-slate-500 hover:text-white' : 'border-slate-200 text-slate-400 hover:text-slate-600'}`} onClick={() => { setIsUploading(false); resetForm(); }}>Discard</Button>
                    <Button type="submit" isLoading={isSaving} className="flex-[2] h-14 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl" disabled={!previewUrl}>
                      {editingItemId ? 'Update Record' : 'Log & Notify'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <GalleryGrid
        images={images}
        isDark={isDark}
        isAdmin={isAdmin || false} // isAdmin is boolean | undefined, but GalleryGrid expects boolean. Wait, UserRole.ADMIN check returns boolean.
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onSelect={setSelectedCoral}
      />
    </div>
  );
};

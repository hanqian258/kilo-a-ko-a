import React, { useState } from 'react';
import { User, CoralImage, UserRole } from '../../types';
import { Button } from '../Button';
import { analyzeCoralImage } from '../../services/geminiService';
import { Camera, Upload, MapPin, Info, X, Sparkles } from 'lucide-react';

interface GalleryViewProps {
  user: User | null;
  images: CoralImage[];
  setImages: React.Dispatch<React.SetStateAction<CoralImage[]>>;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ user, images, setImages }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAiAnalysis(''); 
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    
    // Convert to base64 for Gemini
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeCoralImage(base64String);
      setAiAnalysis(result);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !previewUrl) return;

    const newImage: CoralImage = {
      id: Date.now().toString(),
      url: previewUrl, // In a real app, this would be the S3/storage URL
      uploaderName: user?.name || 'Scientist',
      date: new Date().toISOString().split('T')[0],
      location: location || 'Unknown Location',
      description: aiAnalysis || 'No description provided.',
      aiAnalysis: aiAnalysis
    };

    setImages([newImage, ...images]);
    setIsUploading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setLocation('');
    setAiAnalysis('');
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2 font-serif italic">Kilo a Ko'a</h2>
          <p className="text-slate-600">"Observe the Corals" - A database of coral health monitoring.</p>
        </div>
        
        {user?.role === UserRole.SCIENTIST && !isUploading && (
          <Button onClick={() => setIsUploading(true)} className="flex items-center gap-2">
            <Camera size={18} /> Upload Observation
          </Button>
        )}
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">New Coral Observation</h3>
              <button onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <div className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${previewUrl ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}`}>
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <Upload size={48} className="text-slate-300 mb-2" />
                        <span className="text-sm text-slate-500 font-medium">Click to upload photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                  {previewUrl && (
                    <Button 
                      type="button" 
                      onClick={handleAnalyze} 
                      isLoading={isAnalyzing}
                      disabled={!!aiAnalysis}
                      variant="secondary"
                      className="w-full mt-4"
                    >
                      <Sparkles size={16} className="mr-2" />
                      {aiAnalysis ? 'Analyzed by AI' : 'Analyze with AI'}
                    </Button>
                  )}
                </div>

                <form onSubmit={handleUploadSubmit} className="w-full md:w-1/2 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hanauma Bay" 
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description / AI Analysis</label>
                    <textarea 
                      className="w-full p-2 border border-slate-300 rounded-lg h-32 text-sm"
                      value={aiAnalysis}
                      onChange={(e) => setAiAnalysis(e.target.value)}
                      placeholder="Describe the coral health, species, etc..."
                    />
                  </div>

                  <div className="mt-auto pt-4 flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsUploading(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={!selectedFile}>Submit</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div key={img.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img src={img.url} alt={img.scientificName || "Coral"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                <MapPin size={10} /> {img.location}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <h3 className="font-bold text-slate-800 text-sm">{img.scientificName || "Coral Observation"}</h3>
                   <p className="text-xs text-slate-500">{img.date} • by {img.uploaderName}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                {img.description}
              </p>
              {img.aiAnalysis && (
                <div className="bg-teal-50 p-2 rounded text-xs text-teal-800 flex gap-2 items-start border border-teal-100">
                  <Sparkles size={12} className="mt-0.5 shrink-0" />
                  <span>AI: This appears to be {img.description.slice(0, 50)}...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
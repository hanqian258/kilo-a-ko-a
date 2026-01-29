import React, { useState } from 'react';
import { User, Article, UserRole } from '../../types';
import { Button } from '../Button';
import { Calendar, User as UserIcon, Tag, Plus, Edit2, X, BrainCircuit, Trash2, Image as ImageIcon } from 'lucide-react';
import Editor from 'react-simple-wysiwyg';

interface AwarenessViewProps {
  user: User | null;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  theme: 'light' | 'dark';
}

export const AwarenessView: React.FC<AwarenessViewProps> = ({ user, articles, setArticles, theme }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const isDark = theme === 'dark';
  const isAdmin = user?.role === UserRole.ADMIN;

  const handleEditClick = (article: Article) => {
    setEditingId(article.id);
    setFormData({ title: article.title, content: article.content });
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewClick = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this resource?")) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, content: prev.content + `<br><img src="${base64}" alt="Uploaded content" style="max-width: 100%; border-radius: 8px;" /><br>` }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plainText = formData.content.replace(/<[^>]+>/g, ' ');
    const excerpt = plainText.substring(0, 100) + '...';

    if (editingId) {
      setArticles(articles.map(a => a.id === editingId ? { ...a, title: formData.title, content: formData.content, excerpt } : a));
    } else {
      const newArticle: Article = { id: Date.now().toString(), title: formData.title, content: formData.content, excerpt, author: user?.name || 'Yumin Admin', date: new Date().toISOString().split('T')[0], imageUrl: `https://images.unsplash.com/photo-1544551763-47a0159f963f?auto=format&fit=crop&q=80&w=800&sig=${Date.now()}`, tags: ['CEST', 'Education'] };
      setArticles([newArticle, ...articles]);
    }
    setIsEditorOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b pb-8 gap-6 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-4xl font-black tracking-tight font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Purpose-Driven Education</h2>
          <p className={`flex items-center gap-2 text-lg mt-2 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            <BrainCircuit size={20} className="text-teal-500" />
            Empowering through <strong>CEST</strong> Framework.
          </p>
        </div>
        {isAdmin && !isEditorOpen && (
          <Button onClick={handleNewClick} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">
            <Plus size={20} className="mr-2" /> Publish Knowledge
          </Button>
        )}
      </div>

      {isEditorOpen && (
        <div className={`p-8 rounded-[2.5rem] shadow-2xl border mb-12 animate-in slide-in-from-top-4 transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-2xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingId ? 'Edit Resource' : 'Illuminate a Topic'}</h3>
            <button onClick={() => setIsEditorOpen(false)} className="text-slate-500 hover:text-teal-500"><X size={28} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Topic Title</label>
              <input
                type="text"
                className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Content</label>
              <div className="space-y-2">
                 <div className="flex justify-end">
                    <input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-10 px-4 text-xs font-bold uppercase tracking-widest rounded-xl ${isDark ? 'border-white/10 text-slate-500 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'}`}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <ImageIcon size={16} className="mr-2" /> Insert Image
                    </Button>
                 </div>
                 <div className={`rounded-[1.5rem] overflow-hidden border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                    <Editor
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      containerProps={{ style: { height: '300px', border: 'none' } }}
                    />
                 </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" className={`h-14 px-8 rounded-2xl ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`} onClick={() => setIsEditorOpen(false)}>Cancel</Button>
              <Button type="submit" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">Share Knowledge</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {articles.length === 0 && (
          <div className={`text-center py-20 rounded-[3rem] border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <p className="font-medium italic">No updates available at this time.</p>
          </div>
        )}
        {articles.map((article) => (
          <article key={article.id} className={`rounded-[3rem] overflow-hidden shadow-2xl border transition-all flex flex-col md:flex-row group ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="md:w-1/3 h-80 md:h-auto overflow-hidden relative">
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              {isAdmin && (
                <div className="absolute top-4 left-4 flex gap-2">
                  <button onClick={() => handleEditClick(article)} className="bg-white/90 hover:bg-white p-2.5 rounded-xl shadow-lg text-teal-600 transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(article.id)} className="bg-white/90 hover:bg-white p-2.5 rounded-xl shadow-lg text-red-500 transition-all"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
            <div className="p-10 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {article.date}</span>
                  <span className="flex items-center gap-1.5"><UserIcon size={14} /> {article.author}</span>
                </div>
                <h3 className={`text-3xl font-black tracking-tight font-serif italic mb-4 transition-colors ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-teal-600'}`}>{article.title}</h3>
                <p className={`leading-relaxed mb-8 font-medium line-clamp-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {article.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6">
                <div className="flex gap-3">
                  {article.tags.map(tag => (
                    <span key={tag} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <Tag size={12} /> {tag}
                    </span>
                  ))}
                </div>
                <Button variant="outline" className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest">Explore Lesson</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
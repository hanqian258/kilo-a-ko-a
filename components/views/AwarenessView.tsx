import React, { useState } from 'react';
import { User, Article, UserRole } from '../../types';
import { Button } from '../Button';
import { Calendar, User as UserIcon, Tag, Plus, Edit2, X } from 'lucide-react';

interface AwarenessViewProps {
  user: User | null;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

export const AwarenessView: React.FC<AwarenessViewProps> = ({ user, articles, setArticles }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing article
      setArticles(articles.map(a => a.id === editingId ? {
        ...a,
        title: formData.title,
        content: formData.content,
        excerpt: formData.content.substring(0, 100) + '...'
      } : a));
    } else {
      // Create new article
      const newArticle: Article = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        excerpt: formData.content.substring(0, 100) + '...',
        author: user?.name || 'Admin',
        date: new Date().toISOString().split('T')[0],
        imageUrl: `https://picsum.photos/800/400?random=${Date.now()}`,
        tags: ['Community', 'Update']
      };
      setArticles([newArticle, ...articles]);
    }
    
    setIsEditorOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Coral Conservation & Awareness</h2>
          <p className="text-slate-600">Educational resources on responsible tourism and reef health.</p>
        </div>
        {user?.role === UserRole.ADMIN && !isEditorOpen && (
          <Button onClick={handleNewClick}>
            <Plus size={18} className="mr-2" /> New Article
          </Button>
        )}
      </div>

      {isEditorOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-teal-100 mb-8 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Article' : 'Create New Article'}</h3>
            <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-lg font-medium"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none min-h-[200px]"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? 'Update Article' : 'Publish Article'}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {articles.map((article) => (
          <article key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row hover:shadow-md transition-shadow relative group">
            {user?.role === UserRole.ADMIN && (
              <button 
                onClick={() => handleEditClick(article)}
                className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full text-slate-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-teal-600"
                title="Edit Article"
              >
                <Edit2 size={16} />
              </button>
            )}
            <div className="md:w-1/3 h-64 md:h-auto relative">
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {article.date}</span>
                  <span className="flex items-center gap-1"><UserIcon size={14} /> {article.author}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3 hover:text-teal-700 cursor-pointer">{article.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
                <Button variant="outline" className="text-sm px-4 py-1">Read More</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
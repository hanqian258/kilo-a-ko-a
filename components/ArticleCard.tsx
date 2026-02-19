import React from 'react';
import { Article } from '../types';
import { Button } from './Button';
import { Calendar, User as UserIcon, Tag, Edit2, Trash2 } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  isDark: boolean;
  canEdit: boolean;
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
}

export const ArticleCard = React.memo(({ article, isDark, canEdit, onEdit, onDelete, onExpand }: ArticleCardProps) => {
  return (
    <article className={`rounded-[3rem] overflow-hidden shadow-2xl border transition-all flex flex-col md:flex-row group ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
      <div className="md:w-1/3 h-80 md:h-auto overflow-hidden relative">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          loading="lazy"
          decoding="async"
        />
        {canEdit && (
          <div className="absolute top-4 left-4 flex gap-2">
            <button onClick={() => onEdit(article)} className="bg-white/90 hover:bg-white p-2.5 rounded-xl shadow-lg text-teal-600 transition-all">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(article.id)} className="bg-white/90 hover:bg-white p-2.5 rounded-xl shadow-lg text-red-500 transition-all">
              <Trash2 size={16} />
            </button>
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
          <Button variant="outline" onClick={() => onExpand(article.id)} className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest">Explore Lesson</Button>
        </div>
      </div>
    </article>
  );
});

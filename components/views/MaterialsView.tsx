import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../Button';
import {
  deleteMaterial,
  requestPdfParsing,
  saveMaterial,
  sendDigestEmail,
  subscribeToMaterials,
  uploadMaterialPdf,
} from '../../utils/materialService';
import {
  EducationalMaterial,
  GradeBand,
  LessonBlock,
  LessonBlockType,
  MaterialStatus,
  MaterialType,
  User,
  UserRole,
} from '../../types';

const GRADE_BANDS: Array<'all' | GradeBand> = ['all', 'K-3', '4-6', '7-8', '9-12'];
const BLOCK_TYPES: LessonBlockType[] = ['heading', 'paragraph', 'image', 'video', 'download', 'quiz', 'reflection'];

interface MaterialsViewProps {
  user: User | null;
  theme: 'light' | 'dark';
}

const makeBlock = (type: LessonBlockType): LessonBlock => ({
  id: `block-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type,
  content: type === 'heading' ? 'New section' : '',
  prompt: type === 'quiz' || type === 'reflection' ? '' : undefined,
  options: type === 'quiz' ? ['', '', ''] : undefined,
  answer: type === 'quiz' ? '' : undefined,
  url: ['image', 'video', 'download'].includes(type) ? '' : undefined,
});

const statusStyle = (status: MaterialStatus) => {
  if (status === 'published') return 'bg-green-500/10 text-green-600';
  if (status === 'review') return 'bg-amber-500/10 text-amber-600';
  if (status === 'rejected') return 'bg-red-500/10 text-red-500';
  return 'bg-slate-500/10 text-slate-500';
};

const renderBlock = (block: LessonBlock, isDark: boolean) => {
  if (block.type === 'heading') {
    return <h3 key={block.id} className={`text-3xl font-black font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{block.content}</h3>;
  }
  if (block.type === 'paragraph') {
    return <p key={block.id} className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{block.content}</p>;
  }
  if (block.type === 'image') {
    return block.url ? <img key={block.id} src={block.url} alt={block.content || 'Lesson visual'} className="w-full rounded-3xl object-cover max-h-[420px]" /> : null;
  }
  if (block.type === 'video') {
    return block.url ? <a key={block.id} href={block.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-teal-500 font-black"><LinkIcon size={18} /> {block.content || block.url}</a> : null;
  }
  if (block.type === 'download') {
    return block.url ? <a key={block.id} href={block.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-teal-500 font-black"><Download size={18} /> {block.content || 'Download resource'}</a> : null;
  }
  if (block.type === 'quiz') {
    return (
      <div key={block.id} className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-teal-50 border-teal-100'}`}>
        <p className="font-black text-teal-600 mb-3">Quick Check</p>
        <p className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{block.prompt || block.content}</p>
        <div className="grid gap-2">
          {(block.options || []).filter(Boolean).map((option) => (
            <div key={option} className={`px-4 py-3 rounded-2xl ${isDark ? 'bg-black/20 text-slate-300' : 'bg-white text-slate-700'}`}>{option}</div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div key={block.id} className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
      <p className="font-black text-teal-600 mb-2">Reflection</p>
      <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{block.prompt || block.content}</p>
    </div>
  );
};

/** Animated progress bar shown while a PDF is being parsed server-side. */
const ParseProgressBar: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Animate from 0 → 88% over ~30s, then hold until Firestore updates status.
    const interval = setInterval(() => {
      setPct(prev => {
        if (prev >= 88) { clearInterval(interval); return 88; }
        // Slow down as we approach 88 so it feels realistic.
        return prev + Math.max(0.4, (88 - prev) * 0.04);
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-amber-500">Parsing PDF…</span>
        <span className="text-xs font-bold text-amber-400">{Math.round(pct)}%</span>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Extracting text from your PDF. This usually takes 10–30 seconds.
      </p>
    </div>
  );
};

export const MaterialsView: React.FC<MaterialsViewProps> = ({ user, theme }) => {
  const [materials, setMaterials] = useState<EducationalMaterial[]>([]);
  const [filterGrade, setFilterGrade] = useState<'all' | GradeBand>('all');
  const [filterStatus, setFilterStatus] = useState<'visible' | MaterialStatus>('visible');
  const [search, setSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<EducationalMaterial | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [digestSubject, setDigestSubject] = useState("New Kilo a Ko'a learning materials");
  const [digestMessage, setDigestMessage] = useState('We published new reef education materials for students and community learners.');
  const [digestMaterialIds, setDigestMaterialIds] = useState<string[]>([]);
  const [digestState, setDigestState] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    gradeBand: 'K-3' as GradeBand,
    type: 'pdf' as MaterialType,
    status: 'review' as MaterialStatus,
    tags: 'coral, reef, education',
    blocks: [makeBlock('heading'), makeBlock('paragraph')] as LessonBlock[],
  });

  const isDark = theme === 'dark';
  const canReview = user?.role === UserRole.ADMIN || user?.role === UserRole.SCIENTIST;
  const canSubmit = !!user;

  useEffect(() => {
    const unsubscribe = subscribeToMaterials(setMaterials);
    return () => unsubscribe();
  }, []);

  const visibleMaterials = useMemo(() => {
    const q = search.trim().toLowerCase();

    return materials.filter((material) => {
      const userCanSee = canReview || material.status === 'published' || material.authorId === user?.id;
      const gradeMatches = filterGrade === 'all' || material.gradeBand === filterGrade;
      const statusMatches = filterStatus === 'visible' || material.status === filterStatus;
      const searchTarget = [
        material.title,
        material.summary,
        material.previewText,
        material.parsedText,
        material.authorName,
        material.gradeBand,
        material.type,
        material.tags.join(' '),
      ].join(' ').toLowerCase();

      return userCanSee && gradeMatches && statusMatches && (!q || searchTarget.includes(q));
    });
  }, [canReview, filterGrade, filterStatus, materials, search, user?.id]);

  const publishedMaterials = useMemo(() => materials.filter(material => material.status === 'published'), [materials]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setPdfFile(null);
    setForm({
      title: '',
      summary: '',
      gradeBand: 'K-3',
      type: 'pdf',
      status: canReview ? 'published' : 'review',
      tags: 'coral, reef, education',
      blocks: [makeBlock('heading'), makeBlock('paragraph')],
    });
  }, [canReview]);

  const openNewEditor = () => {
    resetForm();
    setIsEditorOpen(true);
  };

  const openEdit = (material: EducationalMaterial) => {
    setEditingId(material.id);
    setPdfFile(null);
    setForm({
      title: material.title,
      summary: material.summary,
      gradeBand: material.gradeBand,
      type: material.type,
      status: material.status,
      tags: material.tags.join(', '),
      blocks: material.blocks?.length ? material.blocks : [makeBlock('heading'), makeBlock('paragraph')],
    });
    setIsEditorOpen(true);
  };

  const updateBlock = (id: string, update: Partial<LessonBlock>) => {
    setForm(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => block.id === id ? { ...block, ...update } : block),
    }));
  };

  const deleteBlock = (id: string) => {
    setForm(prev => ({ ...prev, blocks: prev.blocks.filter(block => block.id !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.type === 'pdf' && !editingId && !pdfFile) {
      setSaveError('Please choose a PDF file before submitting.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const now = new Date().toISOString();
    const materialId = editingId || `material-${Date.now()}`;
    const existing = materials.find(material => material.id === editingId);

    try {
      let storagePath = existing?.storagePath;
      let downloadUrl = existing?.downloadUrl;
      let parseStatus = existing?.parseStatus;
      let parsedText = existing?.parsedText;
      let previewText = existing?.previewText;

      if (form.type === 'pdf' && pdfFile) {
        const upload = await uploadMaterialPdf(materialId, pdfFile);
        storagePath = upload.storagePath;
        downloadUrl = upload.downloadUrl;
        parseStatus = 'pending';
        parsedText = '';
        previewText = '';
      }

      const material: EducationalMaterial = {
        id: materialId,
        title: form.title,
        summary: form.summary,
        gradeBand: form.gradeBand,
        type: form.type,
        status: canReview ? form.status : 'review',
        authorId: existing?.authorId || user.id,
        authorName: existing?.authorName || user.name,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        publishedAt: (canReview ? form.status : 'review') === 'published' ? existing?.publishedAt || now : undefined,
        storagePath: form.type === 'pdf' ? storagePath : undefined,
        downloadUrl: form.type === 'pdf' ? downloadUrl : undefined,
        parsedText: form.type === 'pdf' ? parsedText : undefined,
        previewText: form.type === 'pdf' ? previewText : undefined,
        parseStatus: form.type === 'pdf' ? parseStatus : undefined,
        blocks: form.type === 'lesson' ? form.blocks : undefined,
      };

      await saveMaterial(material);

      if (form.type === 'pdf' && storagePath && pdfFile) {
        requestPdfParsing(materialId, storagePath).catch(error => {
          console.warn('PDF parsing request failed:', error);
        });
      }

      setIsEditorOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to save material:', error);
      setSaveError(error.message || 'Failed to save material.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (material: EducationalMaterial, status: MaterialStatus) => {
    await saveMaterial({
      ...material,
      status,
      updatedAt: new Date().toISOString(),
      publishedAt: status === 'published' ? material.publishedAt || new Date().toISOString() : material.publishedAt,
    });
  };

  const handleDelete = async (material: EducationalMaterial) => {
    if (!window.confirm(`Delete "${material.title}"? This removes Firestore metadata and its PDF from Storage.`)) return;
    await deleteMaterial(material);
    setSelectedMaterial(null);
  };

  const toggleDigestMaterial = (id: string) => {
    setDigestMaterialIds(prev => prev.includes(id) ? prev.filter(existingId => existingId !== id) : [...prev, id]);
  };

  const handleSendDigest = async () => {
    setDigestState('Sending digest...');
    try {
      const result = await sendDigestEmail({
        subject: digestSubject,
        message: digestMessage,
        materialIds: digestMaterialIds,
      });
      setDigestState(`Digest sent to ${result.recipientCount} subscriber${result.recipientCount === 1 ? '' : 's'}.`);
      setDigestMaterialIds([]);
    } catch (error: any) {
      setDigestState(error.message || 'Digest failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <header className={`flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b pb-8 mb-10 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-teal-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
            <GraduationCap size={18} /> Grade-Banded Learning Library
          </div>
          <h2 className={`text-5xl font-black tracking-tight font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Materials</h2>
          <p className={`text-lg mt-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Browse classroom-ready reef resources, student research, PDFs, and structured lessons by grade band.
          </p>
        </div>
        {canSubmit && (
          <Button onClick={openNewEditor} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">
            <Plus size={20} className="mr-2" /> Submit Material
          </Button>
        )}
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <div>
          <div className={`p-4 rounded-[2rem] border mb-8 flex flex-col gap-4 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-wrap gap-2">
              {GRADE_BANDS.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFilterGrade(grade)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterGrade === grade ? 'bg-teal-600 text-white shadow-lg' : (isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900')}`}
                >
                  {grade === 'all' ? 'All Grades' : grade}
                </button>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <div className={`flex-1 flex items-center gap-3 px-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <Search size={18} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, tags, summary, or parsed PDF text..."
                  className={`w-full bg-transparent py-4 outline-none font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                />
              </div>
              {canReview && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'visible' | MaterialStatus)}
                  className={`px-4 rounded-2xl border font-black uppercase tracking-widest text-xs ${isDark ? 'bg-[#0c1218] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                  aria-label="Filter by status"
                >
                  <option value="visible">All Statuses</option>
                  <option value="review">Needs Review</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
            </div>
          </div>

          {visibleMaterials.length === 0 ? (
            <div className={`text-center py-24 rounded-[3rem] border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              <p className="font-bold italic">No materials match this view yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {visibleMaterials.map((material) => (
                <article key={material.id} className={`rounded-[2.5rem] border shadow-xl overflow-hidden ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
                  <div className={`p-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${material.type === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-teal-500/10 text-teal-600'}`}>
                          {material.type === 'pdf' ? <FileText size={22} /> : <BookOpen size={22} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{material.gradeBand} • {material.type}</p>
                          <h3 className={`text-2xl font-black font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{material.title}</h3>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle(material.status)}`}>
                        {material.status}
                      </span>
                    </div>
                    <p className={`leading-relaxed line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{material.summary}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {material.tags.map((tag) => (
                        <span key={tag} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-bold text-slate-500">By {material.authorName}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSelectedMaterial(material)} className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest">Preview</Button>
                        {canReview && (
                          <>
                            <Button variant="outline" onClick={() => openEdit(material)} className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest">Edit</Button>
                            {material.status !== 'published' && <Button onClick={() => updateStatus(material, 'published')} className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest"><CheckCircle2 size={14} className="mr-2" /> Publish</Button>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {canReview && (
          <aside className="space-y-6">
            <div className={`p-6 rounded-[2rem] border shadow-xl ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-5">
                <Mail className="text-teal-500" />
                <h3 className={`font-black text-xl font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Email Digest</h3>
              </div>
              <div className="space-y-4">
                <input
                  value={digestSubject}
                  onChange={(e) => setDigestSubject(e.target.value)}
                  className={`w-full p-4 rounded-2xl border font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  placeholder="Subject"
                />
                <textarea
                  value={digestMessage}
                  onChange={(e) => setDigestMessage(e.target.value)}
                  className={`w-full p-4 rounded-2xl border font-medium h-32 resize-none ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  placeholder="Digest message"
                />
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {publishedMaterials.map((material) => (
                    <label key={material.id} className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={digestMaterialIds.includes(material.id)}
                        onChange={() => toggleDigestMaterial(material.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className={`block text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{material.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{material.gradeBand}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <Button onClick={handleSendDigest} disabled={!digestSubject || !digestMessage} className="w-full h-12 rounded-2xl font-black uppercase tracking-widest">
                  <Send size={16} className="mr-2" /> Send Digest
                </Button>
                {digestState && <p className="text-xs font-bold text-slate-500">{digestState}</p>}
              </div>
            </div>
          </aside>
        )}
      </section>

      {isEditorOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xl p-4 overflow-y-auto">
          <div className={`max-w-5xl mx-auto my-8 rounded-[3rem] border shadow-2xl ${isDark ? 'bg-[#0c1218] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div>
                <h3 className={`text-3xl font-black font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingId ? 'Edit Material' : 'Submit Material'}</h3>
                <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-2">{canReview ? 'Admin publishing controls enabled' : 'Submissions enter review'}</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-teal-500" aria-label="Close material editor" title="Close">
                <X size={30} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="material-title" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Title</label>
                  <input id="material-title" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>
                <div>
                  <label htmlFor="material-tags" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tags</label>
                  <input id="material-tags" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} className={`w-full p-4 rounded-2xl border font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>
                <div>
                  <label htmlFor="material-grade" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Grade Band</label>
                  <select id="material-grade" value={form.gradeBand} onChange={(e) => setForm({...form, gradeBand: e.target.value as GradeBand})} className={`w-full p-4 rounded-2xl border font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    {GRADE_BANDS.filter(grade => grade !== 'all').map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="material-type" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Material Type</label>
                  <select id="material-type" value={form.type} onChange={(e) => setForm({...form, type: e.target.value as MaterialType})} className={`w-full p-4 rounded-2xl border font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    <option value="pdf">PDF Upload</option>
                    <option value="lesson">Web Lesson</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="material-summary" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Summary</label>
                <textarea id="material-summary" required value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} className={`w-full p-4 rounded-2xl border h-28 resize-none font-medium ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
              </div>

              {canReview && (
                <div>
                  <label htmlFor="material-status" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</label>
                  <select id="material-status" value={form.status} onChange={(e) => setForm({...form, status: e.target.value as MaterialStatus})} className={`w-full md:w-72 p-4 rounded-2xl border font-bold ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    <option value="draft">Draft</option>
                    <option value="review">Needs Review</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              {form.type === 'pdf' ? (
                <div className={`p-8 rounded-[2rem] border border-dashed ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <label className="flex flex-col items-center justify-center gap-4 cursor-pointer text-center">
                    <Upload size={42} className="text-teal-500" />
                    <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{pdfFile ? pdfFile.name : 'Choose PDF file'}</span>
                    <span className="text-xs text-slate-500 font-bold">PDFs are stored in Firebase Storage and parsed for search/preview.</span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {BLOCK_TYPES.map((type) => (
                      <button key={type} type="button" onClick={() => setForm(prev => ({ ...prev, blocks: [...prev.blocks, makeBlock(type)] }))} className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}>
                        + {type}
                      </button>
                    ))}
                  </div>
                  {form.blocks.map((block) => (
                    <div key={block.id} className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">{block.type}</span>
                        <button type="button" onClick={() => deleteBlock(block.id)} className="text-red-500" aria-label={`Delete ${block.type} block`} title="Delete block"><Trash2 size={16} /></button>
                      </div>
                      {['image', 'video', 'download'].includes(block.type) && (
                        <input value={block.url || ''} onChange={(e) => updateBlock(block.id, { url: e.target.value })} placeholder="URL" className={`w-full p-3 mb-3 rounded-xl border ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                      )}
                      {(block.type === 'quiz' || block.type === 'reflection') && (
                        <input value={block.prompt || ''} onChange={(e) => updateBlock(block.id, { prompt: e.target.value })} placeholder="Prompt" className={`w-full p-3 mb-3 rounded-xl border ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                      )}
                      {block.type === 'quiz' && (
                        <div className="grid gap-2 mb-3">
                          {(block.options || []).map((option, index) => (
                            <input key={index} value={option} onChange={(e) => {
                              const options = [...(block.options || [])];
                              options[index] = e.target.value;
                              updateBlock(block.id, { options });
                            }} placeholder={`Option ${index + 1}`} className={`w-full p-3 rounded-xl border ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                          ))}
                        </div>
                      )}
                      <textarea value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })} placeholder="Content" className={`w-full p-3 rounded-xl border min-h-24 resize-y ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-end gap-3 pt-4">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)} className="h-12 px-6 rounded-xl">Cancel</Button>
                  <Button type="submit" isLoading={isSaving} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest">{canReview ? 'Save Material' : 'Submit for Review'}</Button>
                </div>
                {saveError && <p className="text-red-500 text-sm font-bold">{saveError}</p>}
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMaterial && (
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-xl p-4 overflow-y-auto" onClick={() => setSelectedMaterial(null)}>
          <div className={`max-w-4xl mx-auto my-8 rounded-[3rem] border shadow-2xl p-8 ${isDark ? 'bg-[#0c1218] border-white/10' : 'bg-white border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between gap-6 mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-2">{selectedMaterial.gradeBand} • {selectedMaterial.type}</p>
                <h3 className={`text-4xl font-black font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedMaterial.title}</h3>
                <p className="text-sm text-slate-500 mt-2">By {selectedMaterial.authorName}</p>
              </div>
              <button onClick={() => setSelectedMaterial(null)} className="text-slate-400 hover:text-teal-500" aria-label="Close material preview" title="Close"><X size={30} /></button>
            </div>
            <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedMaterial.summary}</p>
            {selectedMaterial.type === 'pdf' ? (
              <div className="space-y-5">
                {selectedMaterial.previewText && <p className={`p-6 rounded-3xl ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>{selectedMaterial.previewText}</p>}
                {selectedMaterial.downloadUrl && <a href={selectedMaterial.downloadUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-teal-500 font-black uppercase tracking-widest"><Download size={18} /> Open PDF</a>}
                {selectedMaterial.parseStatus === 'pending' && <ParseProgressBar isDark={isDark} />}
                {selectedMaterial.parseStatus === 'failed' && <p className="text-red-500 font-bold">PDF parsing failed: {selectedMaterial.parseError}</p>}
              </div>
            ) : (
              <div className="space-y-8">
                {(selectedMaterial.blocks || []).map(block => renderBlock(block, isDark))}
              </div>
            )}
            {canReview && (
              <div className={`mt-10 pt-6 border-t flex flex-wrap gap-3 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <Button onClick={() => openEdit(selectedMaterial)} variant="outline" className="h-11 px-5 rounded-xl">Edit</Button>
                <Button onClick={() => updateStatus(selectedMaterial, 'published')} className="h-11 px-5 rounded-xl">Publish</Button>
                <Button onClick={() => updateStatus(selectedMaterial, 'rejected')} variant="outline" className="h-11 px-5 rounded-xl text-amber-600 border-amber-500/30">Reject</Button>
                <Button onClick={() => handleDelete(selectedMaterial)} variant="danger" className="h-11 px-5 rounded-xl"><Trash2 size={16} className="mr-2" /> Delete</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

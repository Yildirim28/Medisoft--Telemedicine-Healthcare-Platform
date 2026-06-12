import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getArticles, getArticle, createArticle } from '../api';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const CATEGORY_STYLES = {
  general: 'from-gray-100 to-gray-50 text-gray-700 border-gray-200',
  nutrition: 'from-green-100 to-green-50 text-green-700 border-green-200',
  fitness: 'from-blue-100 to-blue-50 text-blue-700 border-blue-200',
  'mental-health': 'from-purple-100 to-purple-50 text-purple-700 border-purple-200',
  'disease-prevention': 'from-red-100 to-red-50 text-red-700 border-red-200',
  medication: 'from-amber-100 to-amber-50 text-amber-700 border-amber-200',
};

const CATEGORY_ICONS = {
  general: '📰',
  nutrition: '🥗',
  fitness: '💪',
  'mental-health': '🧠',
  'disease-prevention': '🛡️',
  medication: '💊',
};

export default function Articles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', tags: '' });

  useEffect(() => {
    getArticles()
      .then((res) => setArticles(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openArticle = async (id) => {
    try {
      const res = await getArticle(id);
      setSelected(res.data || res);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createArticle(form);
      setMsg('Article published!');
      setShowAdd(false);
      setForm({ title: '', content: '', category: 'general', tags: '' });
      getArticles().then((res) => setArticles(res.data || []));
    } catch (err) {
      setMsg(err.message);
    }
  };

  const categories = ['general', 'nutrition', 'fitness', 'mental-health', 'disease-prevention', 'medication'];

  // Article Detail View
  if (selected) {
    const catStyle = CATEGORY_STYLES[selected.category] || CATEGORY_STYLES.general;
    const catIcon = CATEGORY_ICONS[selected.category] || '📰';
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <FadeIn delay={0}>
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-6 font-medium text-sm transition-colors active:scale-[0.97]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Articles
          </button>
          </FadeIn>

          <FadeIn delay={100}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Article Header */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-8 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border bg-gradient-to-r ${catStyle}`}>
                  <span>{catIcon}</span>
                  {selected.category?.replace('-', ' ')}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selected.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {(selected.author_name || selected.author?.full_name || 'A').charAt(0)}
                    </span>
                  </div>
                  {selected.author_name || selected.author?.full_name || 'Admin'}
                </span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(selected.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-8">
              <div className="prose max-w-none text-gray-700 dark:text-gray-300 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                {selected.content}
              </div>

              {/* Tags */}
              {selected.tags && (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.split(',').map((tag) => (
                      <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          </FadeIn>
        </div>
      </Layout>
    );
  }

  // Article List View
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Health Tips & Articles</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{articles.length} articles available</p>
            </div>
          </div>
          {user?.role !== 'patient' && (
            <button
              onClick={() => setShowAdd(!showAdd)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                showAdd
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showAdd ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                )}
              </svg>
              {showAdd ? 'Cancel' : 'Write Article'}
            </button>
          )}
        </div>
        </FadeIn>

        {/* Message */}
        {msg && (
          <div className="p-4 rounded-xl mb-6 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 animate-bounce-in">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {msg}
            </div>
          </div>
        )}

        {/* Write Article Form */}
        {showAdd && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Write a New Article</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <input placeholder="e.g. 10 Tips for a Healthy Heart" className="input-modern" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select className="input-modern" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
                <textarea placeholder="Write your article content here..." className="input-modern" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
                <input placeholder="e.g. health, tips, prevention" className="input-modern" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="mt-4 gradient-btn bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 inline-flex items-center gap-2 active:scale-[0.97]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Publish Article
            </button>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400 dark:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No articles yet</p>
          </div>
        )}

        {/* Articles Grid */}
        <StaggerChildren staggerDelay={80}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => {
            const catStyle = CATEGORY_STYLES[a.category] || CATEGORY_STYLES.general;
            const catIcon = CATEGORY_ICONS[a.category] || '📰';
            return (
              <div
                key={a.article_id}
                onClick={() => openArticle(a.article_id)}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 cursor-pointer hover:shadow-lg hover:border-purple-100 dark:hover:border-purple-700 transition-all duration-300 hover:-translate-y-1 group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-gradient-to-r ${catStyle}`}>
                    <span>{catIcon}</span>
                    {a.category?.replace('-', ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{a.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">
                  {a.content?.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700">
                  <span className="text-xs text-gray-400 dark:text-gray-500 inline-flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium">
                        {(a.author_name || 'A').charAt(0)}
                      </span>
                    </div>
                    {a.author_name || 'Admin'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
        </StaggerChildren>
      </div>
    </Layout>
  );
}

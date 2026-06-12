import { useEffect, useState } from 'react';
import {
  getAdminArticles,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
} from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

export default function AdminArticles() {
  var [articles, setArticles] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [editingArticle, setEditingArticle] = useState(null);
  var [form, setForm] = useState({ title: '', content: '', summary: '', category: '' });
  var [error, setError] = useState('');
  var [search, setSearch] = useState('');

  var loadArticles = function () {
    setLoading(true);
    getAdminArticles({ search: search })
      .then(function (data) { setArticles(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () { loadArticles(); }, [search]);

  var resetForm = function () {
    setForm({ title: '', content: '', summary: '', category: '' });
    setEditingArticle(null);
    setShowForm(false);
    setError('');
  };

  var handleEdit = function (article) {
    setEditingArticle(article);
    setForm({
      title: article.title || '',
      content: article.content || '',
      summary: article.summary || '',
      category: article.category || '',
    });
    setShowForm(true);
    setError('');
  };

  var handleSubmit = function (e) {
    e.preventDefault();
    setError('');
    if (editingArticle) {
      updateAdminArticle(editingArticle.article_id, form)
        .then(function () { resetForm(); loadArticles(); })
        .catch(function (e) { setError(e.response?.data?.error || 'Failed to update article'); });
    } else {
      createAdminArticle(form)
        .then(function () { resetForm(); loadArticles(); })
        .catch(function (e) { setError(e.response?.data?.error || 'Failed to create article'); });
    }
  };

  var handleDelete = function (id) {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    deleteAdminArticle(id).then(loadArticles).catch(console.error);
  };

  return (
    <div>
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <button
            onClick={function () { resetForm(); setShowForm(!showForm); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium active:scale-[0.97]"
          >
            {showForm ? 'Cancel' : '+ Add Article'}
          </button>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={100}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </FadeIn>

      {/* Add/Edit Form */}
      {showForm && (
        <FadeIn delay={100}>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 border animate-bounce-in">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title *"
              value={form.title}
              onChange={function (e) { setForm(Object.assign({}, form, { title: e.target.value })); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Summary"
              value={form.summary}
              onChange={function (e) { setForm(Object.assign({}, form, { summary: e.target.value })); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={function (e) { setForm(Object.assign({}, form, { category: e.target.value })); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Content *"
              value={form.content}
              onChange={function (e) { setForm(Object.assign({}, form, { content: e.target.value })); }}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium active:scale-[0.97]">
            {editingArticle ? 'Update Article' : 'Add Article'}
          </button>
        </form>
        </FadeIn>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No articles found</td></tr>
              )}
              {articles.map(function (a, idx) {
                return (
                  <tr key={a.article_id} className="border-b hover:bg-gray-50 animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3">{a.article_id}</td>
                    <td className="px-4 py-3 font-medium">{a.title}</td>
                    <td className="px-4 py-3">
                      {a.category ? (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{a.category}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">{a.author_name || '-'}</td>
                    <td className="px-4 py-3">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={function () { handleEdit(a); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium active:scale-[0.97]">Edit</button>
                        <button onClick={function () { handleDelete(a.article_id); }} className="text-red-600 hover:text-red-800 text-xs font-medium active:scale-[0.97]">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

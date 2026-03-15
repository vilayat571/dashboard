import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'

const API_URL = 'https://yardimbackend-production.up.railway.app'

interface NewsItem {
  _id: string
  title: string
  description: string
  image: string
  category: string
  date: string
}

// ── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = { title: '', description: '', category: '', date: '' }

const NewsPage = () => {
  const [newsList, setNewsList]     = useState<NewsItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editItem, setEditItem]     = useState<NewsItem | null>(null)
  const [form, setForm]             = useState(emptyForm)
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)

  // ── Fetch all news ────────────────────────────────────────────────────────
  const fetchNews = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/news`)
      const data = await res.json()
      setNewsList(data)
    } catch {
      setError('Xəbərlər yüklənmədi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  // ── Open modal for create ─────────────────────────────────────────────────
  const openCreate = () => {
    setEditItem(null)
    setForm(emptyForm)
    setImageFile(null)
    setShowModal(true)
  }

  // ── Open modal for edit ───────────────────────────────────────────────────
  const openEdit = (item: NewsItem) => {
    setEditItem(item)
    setForm({
      title:       item.title,
      description: item.description,
      category:    item.category,
      date:        item.date.slice(0, 10), // format for date input
    })
    setImageFile(null)
    setShowModal(true)
  }

const handleSave = async () => {
  // ... existing validation code ...

  setSaving(true)

  const formData = new FormData()
  formData.append('title',       form.title)
  formData.append('description', form.description)
  formData.append('category',    form.category)
  formData.append('date',        form.date)
  if (imageFile) formData.append('image', imageFile)

  try {
    const url    = editItem ? `${API_URL}/api/news/edit/${editItem._id}` : `${API_URL}/api/news/create`
    const method = editItem ? 'PUT' : 'POST'

    const res = await fetch(url, { method, body: formData })

    // ← ADD THIS to see real error
    if (!res.ok) {
      const errText = await res.text()
      console.error('Server error:', errText)
      throw new Error(errText)
    }

    setShowModal(false)
    fetchNews()
  } catch (err) {
    console.error('Save failed:', err) // ← check browser console
    alert('Yadda saxlamaq alınmadı: ' + err)
  } finally {
    setSaving(false)
  }
}
  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/news/delete/${id}`, { method: 'DELETE' })
      setDeleteId(null)
      fetchNews()
    } catch {
      alert('Silinmə alınmadı')
    }
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Xəbərlər</h1>
          <p className="text-gray-500 text-sm mt-1">{newsList.length} xəbər</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#8b1a2f] hover:bg-[#8b1a2f text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={17} />
          Yeni Xəbər
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-gray-500">Yüklənir...</div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-20 text-[#8b1a2f">{error}</div>
      )}

      {/* News list */}
      {!loading && !error && (
        <div className="space-y-3">
          {newsList.map(item => (
            <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">

              {/* Image */}
              <img
                src={`${API_URL}/uploads/${item.image}`}
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{item.title}</p>
                <p className="text-gray-500 text-xs mt-1 truncate">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#8b1a2f/40 text-[#8b1a2f text-xs px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {new Date(item.date).toLocaleDateString('az-AZ')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="w-9 h-9 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(item._id)}
                  className="w-9 h-9 bg-gray-800 hover:bg-[#8b1a2f/40 text-gray-400 hover:text-[#8b1a2f rounded-xl flex items-center justify-center transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-white font-bold">{editItem ? 'Xəbəri Düzəlt' : 'Yeni Xəbər'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">

              <div>
                <label className="text-gray-400 text-sm block mb-1">Başlıq</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a2f"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Kateqoriya</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a2f"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Tarix</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a2f"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Mətn</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a2f resize-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Şəkil {editItem && '(dəyişmək istəmirsinizsə boş buraxın)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none file:mr-3 file:bg-gray-700 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Ləğv et
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#8b1a2f] hover:bg-[#8b1a2f disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Save size={15} /> Yadda saxla</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-[#8b1a2f/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-[#8b1a2f" />
            </div>
            <h3 className="text-white font-bold mb-2">Silmək istəyirsiniz?</h3>
            <p className="text-gray-500 text-sm mb-6">Bu əməliyyat geri qaytarıla bilməz</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm transition-colors"
              >
                Ləğv et
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-[#8b1a2f] hover:bg-[#8b1a2f text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsPage

import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Save, Pencil } from 'lucide-react'

const API_URL = 'https://yardimbackend.onrender.com'

interface GalleryItem {
  _id: string
  title: string
  image: string
  category: string
}

const emptyForm = { title: '', category: '' }

const CATEGORIES = ['Şəhid Ailələri', 'Ağac Əkimi', 'Qida Yardımı', 'Fələstin', 'Afrika']

const GalleryPage = () => {
  const [items, setItems]           = useState<GalleryItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editItem, setEditItem]     = useState<GalleryItem | null>(null)
  const [form, setForm]             = useState(emptyForm)
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [filterCat, setFilterCat]   = useState('all')
  const [categories, setCategories] = useState<string[]>([])

  // ── Fetch all gallery items ───────────────────────────────────────────────
  const fetchItems = async () => {
    try {
      setLoading(true)
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`${API_URL}/api/gallery`),
        fetch(`${API_URL}/api/gallery/categories`),
      ])
      const itemsData: GalleryItem[] = await itemsRes.json()
      const catsData: string[]       = await catsRes.json()
      setItems(itemsData)
      setCategories(catsData)
    } catch {
      setError('Qalereya yüklənmədi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  // ── Filtered items ────────────────────────────────────────────────────────
  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat)

  const openCreate = () => {
    setEditItem(null)
    setForm(emptyForm)
    setImageFile(null)
    setShowModal(true)
  }

  const openEdit = (item: GalleryItem) => {
    setEditItem(item)
    setForm({ title: item.title, category: item.category })
    setImageFile(null)
    setShowModal(true)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title || !form.category) {
      alert('Bütün sahələri doldurun')
      return
    }
    if (!editItem && !imageFile) {
      alert('Şəkil seçin')
      return
    }

    setSaving(true)

    const formData = new FormData()
    formData.append('title',    form.title)
    formData.append('category', form.category)
    if (imageFile) formData.append('image', imageFile)

    try {
      const url    = editItem ? `${API_URL}/api/gallery/edit/${editItem._id}` : `${API_URL}/api/gallery/create`
      const method = editItem ? 'PUT' : 'POST'

      const res = await fetch(url, { method, body: formData })
      if (!res.ok) throw new Error('Xəta')

      setShowModal(false)
      fetchItems()
    } catch {
      alert('Yadda saxlamaq alınmadı')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/gallery/delete/${id}`, { method: 'DELETE' })
      setDeleteId(null)
      fetchItems()
    } catch {
      alert('Silinmə alınmadı')
    }
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Qalereya</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} şəkil</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#8b1a2f] hover:bg-[#a01f37] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={17} />
          Yeni Şəkil
        </button>
      </div>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterCat === 'all' ? 'bg-[#8b1a2f] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Hamısı ({items.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterCat === cat ? 'bg-[#8b1a2f] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat} ({items.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="text-center py-20 text-gray-500">Yüklənir...</div>}

      {/* Error */}
      {error && <div className="text-center py-20 text-[#8b1a2f]">{error}</div>}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(item => (
            <div key={item._id} className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">

              {/* Image — item.image is already a full Cloudinary URL */}
              <div className="aspect-square">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.category}</p>
              </div>

              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(item)}
                  className="w-7 h-7 bg-black/70 hover:bg-black text-white rounded-lg flex items-center justify-center"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => setDeleteId(item._id)}
                  className="w-7 h-7 bg-black/70 hover:bg-[#8b1a2f] text-white rounded-lg flex items-center justify-center"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">

            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-white font-bold">{editItem ? 'Şəkili Düzəlt' : 'Yeni Şəkil'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Başlıq</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a2f]"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Kateqoriya</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b1a2f] appearance-none cursor-pointer"
                >
                  <option value="" disabled>Kateqoriya seçin</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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

            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm transition-colors"
              >
                Ləğv et
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#8b1a2f] hover:bg-[#a01f37] disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-[#8b1a2f]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-[#8b1a2f]" />
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
                className="flex-1 bg-[#8b1a2f] hover:bg-[#a01f37] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
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

export default GalleryPage
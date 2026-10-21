import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Loader2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    const slug = name.toLowerCase().replace(/ /g, '-'); // "Ladies Shoes" -> "ladies-shoes"
    
    const { error } = await supabase.from('categories').insert({ name, slug });
    if (error) alert(error.message);
    else {
      setName('');
      fetchCategories();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products in this category will remain but might not show up.')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/dashboard" className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold">Manage Categories</h1>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input 
            placeholder="e.g. Mens Wear, Kids Collection" 
            value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 border rounded-xl p-3 text-sm shadow-sm"
          />
          <button type="submit" disabled={saving} className="bg-emerald-700 text-white px-5 rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          </button>
        </form>

        <div className="space-y-2">
          {loading ? <p>Loading...</p> : categories.map(cat => (
            <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400">/{cat.slug}</p>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

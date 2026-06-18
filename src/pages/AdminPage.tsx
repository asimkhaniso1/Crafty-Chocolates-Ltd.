import React, { useEffect, useState, FormEvent } from 'react';
import { Link, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Plus, Save, LogOut, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface Row {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  gallery: string[];
  category: string;
  format: string;
  events: string[];
  product_type: string[];
  tags: string[];
  chocolate_type: string[];
  flavour: string[];
  fillings: string[];
  certifications: string[];
  piece_count: string | null;
  package_weight: string | null;
  is_published: boolean;
  sort_order: number;
}

const EMPTY: Omit<Row, 'id'> = {
  sku: '', name: '', description: '', price: 0, currency: 'PKR',
  image: '', gallery: [], category: 'Ready to Ship', format: 'Boxes',
  events: [], product_type: [], tags: [],
  chocolate_type: [], flavour: [], fillings: [], certifications: [],
  piece_count: null, package_weight: null,
  is_published: true, sort_order: 999,
};

function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

export default function AdminPage() {
  if (!isSupabaseConfigured) {
    return <Navigate to="/admin/login" replace />;
  }
  return (
    <Routes>
      <Route index element={<RequireAuth><ProductList /></RequireAuth>} />
      <Route path="new" element={<RequireAuth><ProductEditor mode="new" /></RequireAuth>} />
      <Route path="edit/:id" element={<RequireAuth><ProductEditor mode="edit" /></RequireAuth>} />
    </Routes>
  );
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { session, ready } = useSession();
  if (!ready) return <div className="pt-40 text-center text-clay">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace />;
  return children;
}

function ProductList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { void load(); }, []);
  const load = async () => {
    const { data, error } = await supabase!.from('products').select('*').order('sort_order');
    if (error) alert(error.message);
    else setRows((data as Row[]) ?? []);
  };

  const togglePublish = async (r: Row) => {
    const { error } = await supabase!.from('products').update({ is_published: !r.is_published }).eq('id', r.id);
    if (error) alert(error.message); else load();
  };

  const remove = async (r: Row) => {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    const { error } = await supabase!.from('products').delete().eq('id', r.id);
    if (error) alert(error.message); else load();
  };

  const signOut = async () => {
    await supabase!.auth.signOut();
    navigate('/admin/login');
  };

  if (rows === null) return <div className="pt-40 text-center text-clay">Loading products…</div>;

  const filtered = rows.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.sku.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
  });

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-choco">Admin · Products</h1>
            <p className="text-clay text-sm mt-1 font-serif italic">{rows.length} total, {rows.filter(r => r.is_published).length} published</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/new" className="bg-choco text-white px-6 py-3 font-black uppercase tracking-widest text-xs hover:bg-gold transition-all flex items-center gap-2">
              <Plus size={14} /> New product
            </Link>
            <button onClick={signOut} className="border border-choco/20 text-choco px-6 py-3 font-black uppercase tracking-widest text-xs hover:border-choco transition-all flex items-center gap-2">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by SKU or name…"
          className="w-full mb-6 bg-white border border-choco/10 px-4 py-3 text-choco focus:outline-none focus:border-gold"
        />

        <div className="bg-white border border-choco/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-[10px] uppercase tracking-widest font-bold text-clay">
                <th className="text-left px-4 py-3 w-16"></th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Format</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-center px-4 py-3">Published</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-choco/5 hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    {r.image && <img src={r.image} alt="" className="w-12 h-12 object-cover" />}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-clay">{r.sku}</td>
                  <td className="px-4 py-3 font-bold text-choco">{r.name}</td>
                  <td className="px-4 py-3 text-clay">{r.category}</td>
                  <td className="px-4 py-3 text-clay">{r.format}</td>
                  <td className="px-4 py-3 text-right font-bold text-choco whitespace-nowrap">{r.currency} {Number(r.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(r)} className={r.is_published ? 'text-green-700' : 'text-clay/40'}>
                      {r.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/edit/${r.id}`} className="text-gold font-black uppercase tracking-widest text-[10px] mr-4 hover:text-choco">Edit</Link>
                    <button onClick={() => remove(r)} className="text-clay/40 hover:text-red-700"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductEditor({ mode }: { mode: 'new' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [row, setRow] = useState<Omit<Row, 'id'>>(EMPTY);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => {
        const { data, error } = await supabase!.from('products').select('*').eq('id', id).single();
        if (error) setError(error.message);
        else if (data) {
          const { id: _omit, created_at: _c, updated_at: _u, ...rest } = data as any;
          setRow(rest);
        }
        setLoading(false);
      })();
    }
  }, [mode, id]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { ...row, price: Number(row.price), sort_order: Number(row.sort_order) };
    const op = mode === 'edit' && id
      ? supabase!.from('products').update(payload).eq('id', id)
      : supabase!.from('products').insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) setError(error.message);
    else navigate('/admin');
  };

  const setF = <K extends keyof typeof row>(k: K, v: typeof row[K]) => setRow(r => ({ ...r, [k]: v }));
  const setArr = (k: keyof typeof row, v: string) =>
    setRow(r => ({ ...r, [k]: v.split(',').map(s => s.trim()).filter(Boolean) as any }));
  const arrToStr = (a: string[]) => a.join(', ');

  if (loading) return <div className="pt-40 text-center text-clay">Loading…</div>;

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <Link to="/admin" className="mb-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-clay hover:text-gold">
          <ArrowLeft size={14} /> Back to list
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-choco mb-10">
          {mode === 'edit' ? 'Edit product' : 'New product'}
        </h1>

        <form onSubmit={onSave} className="space-y-6 bg-white p-8 border border-choco/10">
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="SKU" required><input value={row.sku} onChange={e => setF('sku', e.target.value)} required className={inputCls} /></Field>
            <Field label="Name" required><input value={row.name} onChange={e => setF('name', e.target.value)} required className={inputCls} /></Field>
            <Field label="Price" required><input type="number" step="0.01" value={row.price} onChange={e => setF('price', Number(e.target.value))} required className={inputCls} /></Field>
            <Field label="Currency"><input value={row.currency} onChange={e => setF('currency', e.target.value)} className={inputCls} /></Field>
            <Field label="Category">
              <select value={row.category} onChange={e => setF('category', e.target.value)} className={inputCls}>
                <option>Ready to Ship</option><option>Custom</option><option>Homeware</option>
              </select>
            </Field>
            <Field label="Format">
              <select value={row.format} onChange={e => setF('format', e.target.value)} className={inputCls}>
                <option>Bars</option><option>Boxes</option><option>Bites</option>
                <option>Blocks</option><option>Pantry</option><option>Homeware</option><option>Other</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea value={row.description} onChange={e => setF('description', e.target.value)} rows={4} className={inputCls} />
          </Field>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Main image URL (e.g. /products/photo.jpg)">
              <input value={row.image} onChange={e => setF('image', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Gallery URLs (comma-separated)">
              <input value={arrToStr(row.gallery)} onChange={e => setArr('gallery', e.target.value)} className={inputCls} />
            </Field>
          </div>

          {row.image && <img src={row.image} alt="" className="w-32 h-32 object-cover border border-choco/10" />}

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Events (comma-separated)"><input value={arrToStr(row.events)} onChange={e => setArr('events', e.target.value)} placeholder="Eid, Ramadan, Wedding" className={inputCls} /></Field>
            <Field label="Product type (comma-separated)"><input value={arrToStr(row.product_type)} onChange={e => setArr('product_type', e.target.value)} placeholder="Chocolate Box" className={inputCls} /></Field>
            <Field label="Chocolate type"><input value={arrToStr(row.chocolate_type)} onChange={e => setArr('chocolate_type', e.target.value)} placeholder="Milk, Dark" className={inputCls} /></Field>
            <Field label="Flavour"><input value={arrToStr(row.flavour)} onChange={e => setArr('flavour', e.target.value)} placeholder="Caramel, Mint" className={inputCls} /></Field>
            <Field label="Fillings"><input value={arrToStr(row.fillings)} onChange={e => setArr('fillings', e.target.value)} className={inputCls} /></Field>
            <Field label="Certifications"><input value={arrToStr(row.certifications)} onChange={e => setArr('certifications', e.target.value)} placeholder="Halal, Gluten Free" className={inputCls} /></Field>
            <Field label="Piece count"><input value={row.piece_count ?? ''} onChange={e => setF('piece_count', e.target.value || null)} className={inputCls} /></Field>
            <Field label="Package weight"><input value={row.package_weight ?? ''} onChange={e => setF('package_weight', e.target.value || null)} className={inputCls} /></Field>
            <Field label="Sort order"><input type="number" value={row.sort_order} onChange={e => setF('sort_order', Number(e.target.value))} className={inputCls} /></Field>
          </div>

          <label className="flex items-center gap-3 text-choco">
            <input type="checkbox" checked={row.is_published} onChange={e => setF('is_published', e.target.checked)} />
            <span className="text-sm font-bold uppercase tracking-widest">Published</span>
          </label>

          {error && <p className="text-red-700 text-sm font-serif italic">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Link to="/admin" className="px-6 py-3 text-clay text-xs font-black uppercase tracking-widest hover:text-choco">Cancel</Link>
            <button type="submit" disabled={saving} className="bg-choco text-white px-8 py-3 font-black uppercase tracking-widest text-xs hover:bg-gold transition-all disabled:opacity-50 flex items-center gap-2">
              <Save size={14} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-stone-50 border border-choco/10 px-4 py-3 text-choco focus:outline-none focus:border-gold";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactElement }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-widest font-bold text-clay">{label}{required && ' *'}</span>
      {children}
    </label>
  );
}

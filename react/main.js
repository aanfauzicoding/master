    const { useState, useEffect } = React;
    // ==========================================
    // API HANDLER
    // ==========================================
    const useDataSdk = () => {
      const [loading, setLoading] = useState(false);
      const [data, setData] = useState([]);
      const [currentUser, setCurrentUser] = useState(null);

      const callApi = async (action, payload = {}, silent = false) => {
        if (!silent) setLoading(true);
        try {
          const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action, ...payload }) });
          const result = await response.json();
          return result;
        } catch (error) {
          console.error("API Error:", error);
          return { status: 'error', message: "Koneksi Gagal." };
        } finally {
          if (!silent) setLoading(false);
        }
      };

      const login = async (username, password) => {
        const res = await callApi('login', { username, password });
        if (res.status === 'success') { setCurrentUser(res.user); await fetchData(); return true; }
        return false;
      };

      const fetchData = async () => {
        const res = await callApi('getAll', {}, true);
        if (res.status === 'success') setData(res.data || []);
      };

      const save = async (item) => {
        const res = await callApi('save', { item });
        if (res.status === 'success') { await fetchData(); return true; }
        return false;
      };

      const deleteItem = async (id) => {
        const res = await callApi('delete', { id });
        if (res.status === 'success') { await fetchData(); return true; }
        return false;
      };

      const resetAll = async () => {
        const res = await callApi('resetAll');
        if (res.status === 'success') { await fetchData(); return true; }
        return false;
      };

      return { data, loading, currentUser, login, fetchData, save, delete: deleteItem, resetAll };
    };

    // ==========================================
    // UI COMPONENTS
    // ==========================================
    
    const ToastContainer = ({ toasts }) => (
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <i className={`${toast.type === 'success' ? 'ri-checkbox-circle-line' : toast.type === 'error' ? 'ri-close-circle-line' : 'ri-information-line'}`}></i>
            <div>
              <div className="font-bold text-sm">{toast.title}</div>
              <div className="text-xs opacity-70">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    );

    const LoginPage = ({ onLogin, loading }) => {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const handleSubmit = async (e) => { e.preventDefault(); await onLogin(username, password); };

      return (
        <div className="h-full w-full flex items-center justify-center z-pt-6 bg-zinc-50 dark:bg-zinc-950">
          <div className="card p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xl">
                <i className="ri-t-shirt-air-line"></i>
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">System Managemen</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Screen Printing</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label> 
                <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="input-field" placeholder="admin" required/>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label> 
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-field" placeholder="•••••" required/>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary h-10 rounded-md text-sm font-medium flex justify-center items-center">
                {loading ? <div className="spinner w-4 h-4 border-2 border-white dark:border-zinc-900 border-t-transparent"></div> : 'Masuk'}
              </button>
            </form>
			<p className="mt-6 text-center text-xs text-zinc-400">Akun Demo Akses Login:</p>
			<p className="mt-3 text-center text-xs text-zinc-400">Admin : admin/123</p>
			<p className="mt-1 text-center text-xs text-zinc-400">Karyawan: karyawan/123</p>
			<p className="mt-1 text-center text-xs text-zinc-400">Sekertaris: sekertaris/123</p>
             <footer id="zirocore-footer">
             <p className="mt-6 text-center text-xs text-zinc-400">Copyright © <a href="https://zirocore.blogspot.com" id="ziro-dev" target="_blank">Ziro Core Inc.</a></p>
             </footer>
          </div>
        </div>
      );
    };

    const Sidebar = ({ user, currentPage, setPage, isOpen, setIsOpen, theme, toggleTheme }) => {
      const menuItems = {
        admin: [
          { id: 'dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
          { id: 'keuangan', icon: 'ri-money-dollar-circle-line', label: 'Keuangan' },
          { id: 'inventaris', icon: 'ri-archive-line', label: 'Inventaris' },
          { id: 'pesanan', icon: 'ri-file-list-3-line', label: 'Pesanan' },
          { id: 'karyawan-list', icon: 'ri-team-line', label: 'Karyawan' },
          { id: 'laporan', icon: 'ri-printer-line', label: 'Laporan & Cetak' }
        ],
        sekertaris: [
          { id: 'dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
          { id: 'keuangan', icon: 'ri-money-dollar-circle-line', label: 'Keuangan' },
          { id: 'pesanan', icon: 'ri-file-list-3-line', label: 'Pesanan' },
          { id: 'laporan', icon: 'ri-printer-line', label: 'Laporan & Cetak' }
        ],
        karyawan: [
          { id: 'dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
          { id: 'inventaris', icon: 'ri-archive-line', label: 'Inventaris' },
          { id: 'pesanan', icon: 'ri-file-list-3-line', label: 'Tugas Saya' }
        ]
      };
      const items = menuItems[user.role] || [];

      return (
        <>
          <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={()=>setIsOpen(false)}></div>
          <div id="sidebar" className={`sidebar w-full md:w-64 h-full flex flex-col ${isOpen ? 'open' : ''}`}>
            <div className="h-14 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-semibold text-zinc-900 dark:text-white"><span className="ri-building-line text-2xl"></span> System Managemen</span>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {items.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => { setPage(item.id); setIsOpen(false); }} 
                  className={`sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${currentPage === item.id ? 'active' : ''}`}
                >
                  <i className={`${item.icon} text-lg`}></i> <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-white">{user.name.charAt(0)}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleTheme} className="flex-1 h-9 px-2 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition">
                  {theme === 'dark' ? <i className="ri-sun-line text-lg"></i> : <i className="ri-moon-line text-lg"></i>}
                </button>
                <button onClick={() => window.location.reload()} className="flex-1 h-9 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-medium rounded-md transition">Keluar</button>
              </div>
            </div>
          </div>
        </>
      );
    };

    // --- SUB COMPONENTS ---

    const Dashboard = ({ data, user }) => {
      const finance = data.filter(d => d.type === 'keuangan');
      const inventory = data.filter(d => d.type === 'inventaris');
      const orders = data.filter(d => d.type === 'pesanan');
      const inc = finance.filter(d => d.category === 'pemasukan').reduce((a,b)=>a+(b.amount||0),0);
      const exp = finance.filter(d => d.category === 'pengeluaran').reduce((a,b)=>a+(b.amount||0),0);

      const StatCard = ({ title, value, color = "text-zinc-900 dark:text-white" }) => (
        <div className="card p-6">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
      );

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user.role !== 'karyawan' && (
              <>
                <StatCard title="Pemasukan" value={`Rp ${inc.toLocaleString('id-ID')}`} color="text-green-600 dark:text-green-400" />
                <StatCard title="Pengeluaran" value={`Rp ${exp.toLocaleString('id-ID')}`} color="text-red-600 dark:text-red-400" />
                <StatCard title="Saldo" value={`Rp ${(inc-exp).toLocaleString('id-ID')}`} color="text-zinc-900 dark:text-white" />
              </>
            )}
            <StatCard title="Pending" value={orders.filter(d=>d.status==='pending').length} color="text-yellow-600 dark:text-yellow-400" />
            <StatCard title="Item" value={inventory.length} color="text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Pesanan Terbaru</h3>
              <div className="space-y-3">
                {orders.slice(-5).reverse().map(o=>(
                  <div key={o.__backendId} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <div><p className="text-sm font-medium text-zinc-900 dark:text-white">{o.customer}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{o.description}</p></div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.status==='selesai'?'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400':'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Stok Kritis</h3>
              <div className="space-y-3">
                {inventory.filter(i=>i.quantity<10).map(i=>(
                  <div key={i.__backendId} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">{i.name}</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{i.quantity} {i.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    const ActionButtons = ({ onEdit, onDelete }) => (
      <div className="flex gap-2">
        <button onClick={onEdit} className="h-8 px-3 inline-flex items-center justify-center rounded-md text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition">Edit</button>
        <button onClick={onDelete} className="h-8 px-3 inline-flex items-center justify-center rounded-md text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-zinc-900 dark:text-white transition">Hapus</button>
      </div>
    );

    const Keuangan = ({ data, sdk, addToast }) => {
      const [formData, setFormData] = useState({ category: 'pemasukan', amount: '', description: '', __backendId: '' });
      const [isEditing, setIsEditing] = useState(false);
      const filtered = data.filter(d => d.type === 'keuangan');

      const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { type: 'keuangan', category: formData.category, amount: parseInt(formData.amount), description: formData.description, date: new Date().toLocaleDateString('id-ID') };
        const success = await sdk.save({ ...payload, __backendId: formData.__backendId || undefined });
        if(success) { addToast('Berhasil', 'Data tersimpan', 'success'); setFormData({ category: 'pemasukan', amount: '', description: '', __backendId: '' }); setIsEditing(false); }
      };

      return (
        <div className="space-y-6">
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Kategori</label>
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="input-field">
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Nominal</label>
                <input type="number" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} className="input-field" placeholder="0" required/>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Keterangan</label>
                <input type="text" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="input-field" placeholder="Ket" required/>
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" className={`flex-1 h-10 px-4 rounded-md text-sm font-medium transition ${isEditing?'bg-blue-600 text-white hover:bg-blue-700':'btn-primary'}`}>{isEditing?'Update':'Simpan'}</button>
                {isEditing && <button type="button" onClick={()=>setIsEditing(false)} className="h-10 px-4 rounded-md text-sm font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition">Batal</button>}
              </div>
            </form>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Tanggal</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Keterangan</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Jumlah</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filtered.map(k => (
                    <tr key={k.__backendId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{k.date}</td>
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{k.description}</td>
                      <td className={`px-4 py-3 font-medium ${k.category==='pemasukan'?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400'}`}>
                        {k.category==='pemasukan'?'+':'-'} Rp {k.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <ActionButtons onEdit={()=>setFormData(k)} onDelete={async () => { if(confirm('Hapus?')) await sdk.delete(k.__backendId); }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    const Inventaris = ({ data, sdk, addToast }) => {
      const [formData, setFormData] = useState({ name: '', category: 'bahan', quantity: '', unit: '', __backendId: '' });
      const filtered = data.filter(d => d.type === 'inventaris');
      const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { type: 'inventaris', ...formData, quantity: parseInt(formData.quantity) };
        if(await sdk.save(payload)) { addToast('Tersimpan', 'Stok diperbarui', 'success'); setFormData({ name: '', category: 'bahan', quantity: '', unit: '', __backendId: '' }); }
      };
      return (
        <div className="space-y-6">
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div><input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Barang" required/></div>
              <div>
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="input-field">
                  <option value="bahan">Bahan</option><option value="tinta">Tinta</option><option value="alat">Alat</option>
                </select>
              </div>
              <div><input type="number" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value})} className="input-field" placeholder="Qty" required/></div>
              <div><input value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})} className="input-field" placeholder="Satuan" required/></div>
              <button type="submit" className="btn-primary h-10 px-4 rounded-md text-sm font-medium">Tambah</button>
            </form>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Barang</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Stok</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Status</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filtered.map(i => (
                    <tr key={i.__backendId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{i.name}</td>
                      <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">{i.quantity} {i.unit}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${i.quantity<10?'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400':'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                          {i.quantity<10?'Rendah':'Aman'}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={async () => await sdk.save({ ...i, quantity: i.quantity + 10 })} className="h-8 w-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white transition">+10</button>
                        <ActionButtons onEdit={()=>setFormData(i)} onDelete={async () => { if(confirm('Hapus?')) await sdk.delete(i.__backendId); }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    const Pesanan = ({ data, sdk, addToast, user }) => {
      const [formData, setFormData] = useState({ customer: '', description: '', quantity: '', total: '', __backendId: '' });
      const filtered = data.filter(d => d.type === 'pesanan');
      const canAdd = user.role !== 'karyawan';
      const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { type: 'pesanan', ...formData, quantity: parseInt(formData.quantity), total: parseInt(formData.total), status: 'pending' };
        if(await sdk.save(payload)) { addToast('Dibuat', 'Order masuk', 'success'); setFormData({ customer: '', description: '', quantity: '', total: '', __backendId: '' }); }
      };
      return (
        <div className="space-y-6">
          {canAdd && <div className="card p-6"><form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"><div><input value={formData.customer} onChange={e=>setFormData({...formData, customer: e.target.value})} className="input-field" placeholder="Pelanggan" required/></div><div><input value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="input-field" placeholder="Detail" required/></div><div><input type="number" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value})} className="input-field" placeholder="Qty" required/></div><div><input type="number" value={formData.total} onChange={e=>setFormData({...formData, total: e.target.value})} className="input-field" placeholder="Total Rp" required/></div><button type="submit" className="btn-primary h-10 px-4 rounded-md text-sm font-medium">Input</button></form></div>}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Pelanggan</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Pesanan</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Status</th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filtered.map(p => (
                    <tr key={p.__backendId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">{p.customer}</td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{p.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-zinc-500/10 ${p.status==='selesai'?'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-green-600/20':p.status==='proses'?'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-blue-700/10':'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 ring-yellow-600/20'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {p.status!=='selesai' && <button onClick={async()=>await sdk.save({...p, status:'selesai'})} className="text-xs font-medium text-zinc-900 dark:text-white hover:underline">Selesai</button>}
                        {canAdd && <ActionButtons onEdit={()=>setFormData(p)} onDelete={async () => { if(confirm('Hapus?')) await sdk.delete(p.__backendId); }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    const Karyawan = ({ data, sdk, addToast }) => {
      const [formData, setFormData] = useState({ name: '', role: 'operator', phone: '', __backendId: '' });
      const filtered = data.filter(d => d.type === 'karyawan_data');
      const handleSubmit = async (e) => { e.preventDefault(); const payload = { type: 'karyawan_data', name: formData.name, role: formData.role, phone: formData.phone }; if(await sdk.save(payload)) { addToast('Tersimpan', 'Data karyawan diperbarui', 'success'); setFormData({ name: '', role: 'operator', phone: '', __backendId: '' }); } };
      return (
        <div className="space-y-6">
          <div className="card p-6"><form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div><input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Nama" required/></div><div><select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="input-field"><option value="operator">Operator</option><option value="desainer">Desainer</option><option value="admin">Admin</option><option value="kurir">Kurir</option></select></div><div><input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="input-field" placeholder="Telp" required/></div><button type="submit" className="btn-primary h-10 px-4 rounded-md text-sm font-medium">Simpan</button></form></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(k => (<div key={k.__backendId} className="card p-6 flex flex-col items-center text-center relative"><div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center text-lg font-bold mb-3">{k.name.charAt(0)}</div><h4 className="font-bold text-zinc-900 dark:text-white">{k.name}</h4><span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mt-1 mb-2">{k.role}</span><p className="text-sm text-zinc-400 mb-4">{k.phone || '-'}</p><div className="flex gap-2 mt-auto"><ActionButtons onEdit={()=>setFormData(k)} onDelete={async () => { if(confirm('Hapus?')) await sdk.delete(k.__backendId); }} /></div></div>))}</div>
        </div>
      );
    };

    // --- KOMPONEN LAPORAN YANG DIPERBARUI ---
    const Laporan = ({ data, sdk, addToast, user }) => {
      const [dateStart, setDateStart] = useState('');
      const [dateEnd, setDateEnd] = useState('');

      // 1. Preview Realtime (All Time Data)
      const financeAll = data.filter(d => d.type === 'keuangan');
      const ordersAll = data.filter(d => d.type === 'pesanan');
      
      const incAll = financeAll.filter(d => d.category === 'pemasukan').reduce((a,b)=>a+(b.amount||0),0);
      const expAll = financeAll.filter(d => d.category === 'pengeluaran').reduce((a,b)=>a+(b.amount||0),0);
      const orderCountAll = ordersAll.length;
      const orderValueAll = ordersAll.reduce((a,b)=>a+(b.total||0),0);

      // 2. Fungsi Cetak (Menggunakan Filter Tanggal)
      const handlePrint = () => {
        // Filter Data & Parsing Tanggal
        const parseDate = (str) => str ? new Date(str) : new Date('1970-01-01');
        const start = parseDate(dateStart);
        const end = dateEnd ? new Date(dateEnd) : new Date('2099-12-31');

        // Filter untuk Keuangan & Pesanan (Berdasarkan Tanggal)
        const filterByDate = (item) => {
          if(!item.date) return false;
          const d = new Date(item.date);
          return d >= start && d <= end;
        };

        const financeData = data.filter(d => d.type === 'keuangan' && filterByDate(d));
        const orderData = data.filter(d => d.type === 'pesanan' && filterByDate(d));
        
        // Inventory & Karyawan menampilkan status saat ini (Tanpa Filter Tanggal)
        const inventoryData = data.filter(d => d.type === 'inventaris');
        const employeeData = data.filter(d => d.type === 'karyawan_data');

        // Hitung Agregat
        const inc = financeData.filter(d => d.category === 'pemasukan').reduce((a,b)=>a+(b.amount||0),0);
        const exp = financeData.filter(d => d.category === 'pengeluaran').reduce((a,b)=>a+(b.amount||0),0);
        const totalOrdVal = orderData.reduce((a,b)=>a+(b.total||0),0);

        const dateRangeText = dateStart && dateEnd ? `Periode: ${dateStart} s/d ${dateEnd}` : (dateStart ? `Periode: ${dateStart} Sekarang` : "Seluruh Periode (Data Realtime)");

        // Generate HTML Report
        const reportHTML = `
          <div style="font-family: 'Inter', sans-serif; color: #000;">
            <!-- HEADER -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px;">
              <h1 style="margin:0; font-size: 24px; text-transform: uppercase; font-weight: 800; letter-spacing: -0.5px;">System Managemen</h1>
              <p style="margin:5px 0; font-size: 14px; font-weight: 500;">Laporan Rekapan Operasional & Keuangan</p>
              <p style="margin:5px 0; font-size: 12px; color: #666;">${dateRangeText}</p>
            </div>

            <div style="text-align: right; margin-bottom: 20px; font-size: 12px;">
              <p>Dicetak: ${new Date().toLocaleString('id-ID')}</p>
              <p>Oleh: ${user.name} (${user.role})</p>
            </div>

            <!-- 1. RINGKASAN KEUANGAN -->
            <div style="background: #000; color: #fff; padding: 6px 10px; margin-top: 20px; font-weight: 600; font-size: 12px;">1. LAPORAN RINGKASAN KEUANGAN</div>
            <div style="margin-bottom: 20px; border: 1px solid #000; padding: 10px;">
              <table style="width: 100%; border: none; font-size: 13px;">
                <tr><td style="width: 50%; padding: 4px;">Total Pemasukan</td><td style="text-align: right; font-weight: bold;">Rp ${inc.toLocaleString('id-ID')}</td></tr>
                <tr><td style="width: 50%; padding: 4px;">Total Pengeluaran</td><td style="text-align: right; font-weight: bold;">Rp ${exp.toLocaleString('id-ID')}</td></tr>
                <tr style="border-top: 2px solid #000;"><td style="width: 50%; padding: 4px; font-weight: bold; margin-top: 4px;">Laba / Rugi Bersih</td><td style="text-align: right; font-weight: bold; margin-top: 4px;">Rp ${(inc-exp).toLocaleString('id-ID')}</td></tr>
              </table>
            </div>

            <table class="print-table">
              <thead>
                <tr><th width="15%">Tanggal</th><th>Kategori</th><th>Keterangan</th><th width="20%" style="text-align: right;">Nominal</th></tr>
              </thead>
              <tbody>
                ${financeData.length > 0 ? financeData.map(f => `
                  <tr>
                    <td>${f.date}</td>
                    <td><span style="background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${f.category.toUpperCase()}</span></td>
                    <td>${f.description}</td>
                    <td style="text-align: right;">${f.amount.toLocaleString('id-ID')}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 10px; color: #666;">Tidak ada data transaksi pada periode ini.</td></tr>'}
              </tbody>
            </table>

            <!-- 2. RINGKASAN PESANAN -->
            <div style="background: #000; color: #fff; padding: 6px 10px; margin-top: 30px; font-weight: 600; font-size: 12px;">2. LAPORAN RINGKASAN PESANAN</div>
            <div style="margin-bottom: 20px; border: 1px solid #000; padding: 10px;">
              <table style="width: 100%; border: none; font-size: 13px;">
                <tr><td style="width: 50%; padding: 4px;">Total Pesanan Masuk</td><td style="text-align: right; font-weight: bold;">${orderData.length} Order</td></tr>
                <tr><td style="width: 50%; padding: 4px;">Total Nilai Penjualan</td><td style="text-align: right; font-weight: bold;">Rp ${totalOrdVal.toLocaleString('id-ID')}</td></tr>
                <tr><td style="width: 50%; padding: 4px;">Pesanan Selesai</td><td style="text-align: right; font-weight: bold;">${orderData.filter(o=>o.status==='selesai').length}</td></tr>
                <tr><td style="width: 50%; padding: 4px;">Pesanan Pending/Proses</td><td style="text-align: right; font-weight: bold;">${orderData.filter(o=>o.status!=='selesai').length}</td></tr>
              </table>
            </div>

            <table class="print-table">
              <thead>
                <tr><th width="25%">Pelanggan</th><th>Deskripsi Pesanan</th><th width="10%">Qty</th><th width="20%" style="text-align: right;">Total</th><th width="15%">Status</th></tr>
              </thead>
              <tbody>
                ${orderData.length > 0 ? orderData.map(p => `
                  <tr>
                    <td style="font-weight: bold;">${p.customer}</td>
                    <td>${p.description}</td>
                    <td style="text-align: center;">${p.quantity}</td>
                    <td style="text-align: right;">Rp ${p.total.toLocaleString('id-ID')}</td>
                    <td style="text-align: center;">${p.status.toUpperCase()}</td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 10px; color: #666;">Tidak ada data pesanan pada periode ini.</td></tr>'}
              </tbody>
            </table>

            <!-- 3. RINGKASAN INVENTARIS -->
            <div style="background: #000; color: #fff; padding: 6px 10px; margin-top: 30px; font-weight: 600; font-size: 12px;">3. LAPORAN RINGKASAN INVENTARIS</div>
            <div style="margin-bottom: 20px; border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold;">
               Total Item Inventaris: ${inventoryData.length}
            </div>

            <table class="print-table">
              <thead>
                <tr><th>Nama Barang</th><th>Kategori</th><th style="text-align: center;">Stok</th><th>Satuan</th><th style="text-align: center;">Status</th></tr>
              </thead>
              <tbody>
                ${inventoryData.length > 0 ? inventoryData.map(i => `
                  <tr>
                    <td>${i.name}</td>
                    <td>${i.category}</td>
                    <td style="text-align: center; font-weight: bold;">${i.quantity}</td>
                    <td>${i.unit}</td>
                    <td style="text-align: center;">${i.quantity < 10 ? '<span style="color: red; font-weight: bold;">KRITIS</span>' : 'AMAN'}</td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 10px; color: #666;">Data inventaris kosong.</td></tr>'}
              </tbody>
            </table>

            <!-- 4. RINGKASAN KARYAWAN (ADMIN ONLY) -->
            ${user.role === 'admin' ? `
            <div style="background: #000; color: #fff; padding: 6px 10px; margin-top: 30px; font-weight: 600; font-size: 12px;">4. LAPORAN RINGKASAN KARYAWAN</div>
            <table class="print-table">
              <thead>
                <tr><th>Nama Lengkap</th><th>Jabatan</th><th>Kontak</th></tr>
              </thead>
              <tbody>
                ${employeeData.length > 0 ? employeeData.map(e => `
                  <tr>
                    <td style="font-weight: bold;">${e.name}</td>
                    <td>${e.role.toUpperCase()}</td>
                    <td>${e.phone || '-'}</td>
                  </tr>
                `).join('') : '<tr><td colspan="3" style="text-align: center; padding: 10px; color: #666;">Belum ada data karyawan.</td></tr>'}
              </tbody>
            </table>
            ` : ''}

            <!-- FOOTER -->
            <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 10px; color: #666;">
              <p>Dokumen ini dihasilkan secara otomatis oleh System Managemen.</p>
              <p>Harap simpan file ini sebagai arsip digital jika diperlukan.</p>
            </div>
          </div>
        `;

        // Inject HTML & Print
        document.getElementById('print-content-body').innerHTML = reportHTML;
        window.print();
      };
      
      return (
        <div className="space-y-6">
          {/* 1. FILTER & AKSI LAPORAN */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Filter & Aksi Laporan</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Gunakan filter tanggal di bawah ini untuk membatasi data yang dicetak. Data di layar adalah "All Time" (Seluruh Waktu).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Tanggal Awal</label>
                <input type="date" value={dateStart} onChange={e=>setDateStart(e.target.value)} className="input-field bg-white dark:bg-zinc-900"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Tanggal Akhir</label>
                <input type="date" value={dateEnd} onChange={e=>setDateEnd(e.target.value)} className="input-field bg-white dark:bg-zinc-900"/>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={handlePrint} className="flex-1 btn-primary h-10 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition">
                  <i className="ri-printer-line"></i> Cetak Laporan
                </button>
              </div>
              {user.role === 'admin' && (
                <div className="flex items-end">
                   <button onClick={async()=>{if(confirm('⚠️PERINGATAN!! Reset Data Akan Menghilangkan Semua Data Anda!!')){await sdk.resetAll(); addToast('Reset','Data Anda Telah Dibersihkan','info');}}} className="flex-1 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-10 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition">
                     <i className="ri-delete-bin-2-line"></i> Reset
                   </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. PREVIEW KEUANGAN (ALL TIME) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 border-t-4 border-green-500">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="ri-money-dollar-circle-line text-green-600 dark:text-green-400"></i> Keuangan (All Time)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Pemasukan</span>
                  <span className="font-bold text-green-600 dark:text-green-400">Rp {incAll.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Pengeluaran</span>
                  <span className="font-bold text-red-600 dark:text-red-400">Rp {expAll.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">Laba / Rugi</span>
                  <span className={`font-bold text-lg ${(incAll-expAll) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>Rp {(incAll-expAll).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* 3. PREVIEW PESANAN (ALL TIME) */}
            <div className="card p-6 border-t-4 border-blue-500">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="ri-file-list-3-line text-blue-600 dark:text-blue-400"></i> Pesanan (All Time)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Pesanan Masuk</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{orderCountAll} Order</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Nilai Penjualan</span>
                  <span className="font-bold text-zinc-900 dark:text-white">Rp {orderValueAll.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      );
    };

    // ==========================================
    // MAIN APP
    // ==========================================
    const App = () => {
      const [page, setPage] = useState('dashboard');
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [toasts, setToasts] = useState([]);
      
      const sdk = useDataSdk();

      // --- THEME LOGIC ---
      const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
      useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') { root.classList.add('dark'); } else { root.classList.remove('dark'); }
        localStorage.setItem('theme', theme);
      }, [theme]);
      const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

      const addToast = (title, message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
      };

      if (SCRIPT_URL.includes("MASUKKAN")) {
        return (
          <div className="h-full w-full flex items-center justify-center z-pt-10 bg-zinc-50 dark:bg-zinc-950">
            <div className="card p-8 max-w-md text-center border-t-4 border-zinc-900 dark:border-zinc-700">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-zinc-900 dark:text-white font-bold text-xl mb-2">DATABASE DIPERLUKAN</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mb-2 text-sm">"Hubungi Developer."</p>
			  <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">"Untuk Mengaktifkan Paket Layanan Anda."</p>
              <div className="text-zinc-400 dark:text-zinc-500 font-bold text-sm"><i className="ri-cloud-windy-fill"></i> Ziro Cloud</div>
			  <p className="text-zinc-800 dark:text-zinc-200 mt-1 text-sm">Copyright© <a className="text-yellow-500" href="/">Ziro Core Inc.</a></p>
            </div>
          </div>
        );
      }

      useEffect(() => {
        if (!sdk.currentUser) return;
        sdk.fetchData();
        const interval = setInterval(() => sdk.fetchData(), 10000);
        return () => clearInterval(interval);
      }, [sdk.currentUser]);

      const handleLogin = async (u, p) => {
        const success = await sdk.login(u, p);
        if (success) addToast('Selamat Datang', 'Terhubung Server', 'success');
        else addToast('Gagal', 'Cek username/password', 'error');
      };

      if (!sdk.currentUser) {
        return (
          <>
            <LoginPage onLogin={handleLogin} loading={sdk.loading} />
            <ToastContainer toasts={toasts} />
          </>
        );
      }

      return (
        <div className="h-full w-full flex overflow-hidden bg-zinc-50 dark:bg-zinc-950">
          {sdk.loading && <div id="loading-overlay"><div className="spinner"></div><p className="text-zinc-600 dark:text-zinc-400 font-medium mt-4 animate-pulse">Memuat...</p></div>}
          
          <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}><i className="ri-menu-3-line text-xl"></i></button>
          <Sidebar user={sdk.currentUser} currentPage={page} setPage={setPage} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} theme={theme} toggleTheme={toggleTheme} />

          <main className="flex-1 overflow-y-auto main-content">
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white capitalize tracking-tight">{page.replace('-', ' ')}</h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1"> System Managemen</p>
                </div>
                <div className="text-right sm:block">
                  <div className="text-xs font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded inline-flex items-center gap-1 animate-pulse"><span className="w-2 h-2 rounded-full bg-green-500"></span> ZIRO SERVER DEMO</div>
				  <p className="text-xs font-medium text-zinc-900 dark:text-white px-2 py-1 rounded items-center gap-1"><span className="inline-flex text-green-500"><i className="ri-paint-brush-fill"></i></span> Ziro Core App V1.2.0</p>
                  <div className="text-xs text-zinc-400 mt-1 font-mono">{new Date().toLocaleTimeString('id-ID')}</div>
                 <footer id="zirocore-footer">
                  <p className="text-xs text-zinc-400 mt-1 font-mono">Copyright © <a href="https://zirocore.blogspot.com" id="ziro-dev" target="_blank">Ziro Core Inc.</a></p>
                 </footer>
				</div>
              </div>

              <div id="content-area" className="pb-20">
                {page === 'dashboard' && <Dashboard data={sdk.data} user={sdk.currentUser} />}
                {page === 'keuangan' && <Keuangan data={sdk.data} sdk={sdk} addToast={addToast} />}
                {page === 'inventaris' && <Inventaris data={sdk.data} sdk={sdk} addToast={addToast} />}
                {page === 'pesanan' && <Pesanan data={sdk.data} sdk={sdk} addToast={addToast} user={sdk.currentUser} />}
                {page === 'karyawan-list' && <Karyawan data={sdk.data} sdk={sdk} addToast={addToast} />}
                {page === 'laporan' && <Laporan data={sdk.data} sdk={sdk} addToast={addToast} user={sdk.currentUser} />}
              </div>
            </div>
          </main>

          <ToastContainer toasts={toasts} />
          <div id="printable-area"><div id="print-content-body"></div></div>
        </div>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);

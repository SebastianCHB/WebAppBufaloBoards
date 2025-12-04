import React, { useState, useEffect } from 'react';
import client from '../api/axios';
import { 
    FiUsers, FiLogOut, FiEdit2, FiTrash2, 
    FiSave, FiRefreshCw, FiX, FiList, FiCheckSquare, 
    FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiLayout 
} from 'react-icons/fi';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    const initialForm = { name: '', email: '', role: 'user', password: '' };
    const [form, setForm] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    let userLoggedIn = { name: 'Admin', role: 'admin' };
    try {
        const stored = localStorage.getItem('user');
        if (stored) userLoggedIn = JSON.parse(stored);
    } catch(e) {}

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '/users';
            if (activeTab === 'boards') endpoint = '/boards';
            if (activeTab === 'lists') endpoint = '/lists';
            if (activeTab === 'tasks') endpoint = '/tasks';

            const res = await client.get(endpoint);
            setData(res.data);
        } catch (error) {
            console.error(error);
            if (activeTab !== 'users') {
                setData([]); 
            } else {
                showToast("Error al cargar datos", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setData([]);
        fetchData();
        setForm(initialForm);
        setIsEditing(false);
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (activeTab === 'users') {
                if (isEditing) {
                    await client.put(`/users/${editId}`, form);
                    showToast("Usuario actualizado");
                } else {
                    await client.post('/users', form);
                    showToast("Usuario creado");
                }
                setForm(initialForm);
                setIsEditing(false);
                setEditId(null);
                fetchData();
            } else {
                showToast("Gestión disponible solo en el Tablero visual", "error");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Error al guardar";
            showToast(msg, "error");
        } finally {
            setProcessing(false);
        }
    };

    const requestDelete = (id) => {
        setDeleteModal({ show: true, id });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        setDeleteModal({ show: false, id: null });
        
        try {
            let endpoint = `/users/${id}`;
            if (activeTab === 'boards') endpoint = `/boards/${id}`;
            if (activeTab === 'lists') endpoint = `/lists/${id}`;
            if (activeTab === 'tasks') endpoint = `/tasks/${id}`;

            await client.delete(endpoint);
            setData(data.filter(item => item.id !== id));
            showToast("Registro eliminado");
        } catch (error) {
            showToast("No se pudo eliminar", "error");
        }
    };

    const handleEdit = (item) => {
        if (activeTab === 'users') {
            setForm({ name: item.name, email: item.email, role: item.role, password: '' });
            setIsEditing(true);
            setEditId(item.id);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="app-container" style={{position: 'relative'}}>
            
            {(loading || processing) && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'4px', background:'rgba(255,255,255,0.1)', zIndex:9999}}>
                    <div style={{height:'100%', background:'var(--color-celestial)', width:'100%', animation:'indeterminate 1.5s infinite linear', transformOrigin: '0% 50%'}}></div>
                </div>
            )}

            {toast.show && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                    background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: 'white', padding: '15px 25px', borderRadius: '12px',
                    backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {toast.type === 'success' ? <FiCheckCircle size={20}/> : <FiAlertCircle size={20}/>}
                    <span>{toast.message}</span>
                </div>
            )}

            {deleteModal.show && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-card" style={{maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)'}}>
                        <div style={{marginBottom: '20px', color: '#fca5a5'}}>
                            <FiAlertTriangle size={50} />
                        </div>
                        <h3 style={{marginBottom: '10px'}}>¿Estás seguro?</h3>
                        <p style={{marginBottom: '25px', opacity: 0.8}}>Esta acción no se puede deshacer.</p>
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                            <button onClick={() => setDeleteModal({ show: false, id: null })} style={{padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', cursor: 'pointer'}}>Cancelar</button>
                            <button onClick={confirmDelete} style={{padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold'}}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes indeterminate {
                    0% { transform:  translateX(0) scaleX(0); }
                    40% { transform:  translateX(0) scaleX(0.4); }
                    100% { transform:  translateX(100%) scaleX(0.5); }
                }
            `}</style>

            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-text">BufaloAdmin</div>
                </div>

                <nav className="sidebar-nav">
                    <button onClick={() => setActiveTab('users')} className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} style={{background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:'1rem'}}>
                        <FiUsers /> Usuarios
                    </button>
                    <button onClick={() => setActiveTab('boards')} className={`nav-item ${activeTab === 'boards' ? 'active' : ''}`} style={{background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:'1rem'}}>
                        <FiLayout /> Proyectos
                    </button>
                    <button onClick={() => setActiveTab('lists')} className={`nav-item ${activeTab === 'lists' ? 'active' : ''}`} style={{background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:'1rem'}}>
                        <FiList /> Listas
                    </button>
                    <button onClick={() => setActiveTab('tasks')} className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} style={{background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:'1rem'}}>
                        <FiCheckSquare /> Tareas
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn-sidebar">
                        <FiLogOut /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            <div className="main-wrapper">
                <header className="topbar">
                    <div className="topbar-left">
                        <h3>Gestión de {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                    </div>
                    <div className="topbar-right">
                        <div className="user-profile">
                            <div className="avatar">{userLoggedIn.name.charAt(0).toUpperCase()}</div>
                            <div className="user-info">
                                <span className="name">{userLoggedIn.name}</span>
                                <span className="role">{userLoggedIn.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="content-area">
                    <div className="stats-row">
                        <div className="card-stat">
                            <div className="stat-icon-bg"><FiUsers/></div>
                            <div><h3>{activeTab === 'users' ? data.length : '-'}</h3><p>Usuarios</p></div>
                        </div>
                        <div className="card-stat">
                            <div className="stat-icon-bg"><FiLayout/></div>
                            <div><h3>{activeTab === 'boards' ? data.length : '-'}</h3><p>Tableros</p></div>
                        </div>
                        <div className="card-stat">
                            <div className="stat-icon-bg"><FiCheckSquare/></div>
                            <div><h3>{activeTab === 'tasks' ? data.length : '-'}</h3><p>Tareas</p></div>
                        </div>
                    </div>

                    <div className="main-grid">
                        
                        {activeTab === 'users' && (
                            <div className="panel-card form-panel">
                                <div className="panel-header">
                                    <h3>{isEditing ? 'Editar' : 'Nuevo'} Usuario</h3>
                                    {isEditing && (
                                        <button onClick={() => { setIsEditing(false); setForm(initialForm); }} style={{background:'none', border:'none', color:'red', cursor:'pointer'}}><FiX/></button>
                                    )}
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input type="text" name="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-dark" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-dark" required />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group" style={{flex:1}}>
                                            <label>Rol</label>
                                            <select name="role" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="glass-select">
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{flex:1}}>
                                            <label>Password</label>
                                            <input type="password" name="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-dark" placeholder={isEditing ? 'Opcional' : '***'} />
                                        </div>
                                    </div>
                                    <button type="submit" className="yummy-button" disabled={processing}>
                                        {processing ? <FiRefreshCw className="spin"/> : <FiSave />} Guardar
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="panel-card table-panel" style={{ gridColumn: activeTab === 'users' ? 'auto' : '1 / -1' }}>
                            <div className="panel-header">
                                <h3>Registros ({data.length})</h3>
                                <button onClick={fetchData} className="action-icon"><FiRefreshCw className={loading ? 'spin' : ''}/></button>
                            </div>
                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre / Título</th>
                                            
                                            {/* Columnas Dinámicas */}
                                            {activeTab === 'users' && <><th>Email</th><th>Rol</th></>}
                                            {activeTab === 'boards' && <th>Dueño</th>}
                                            {activeTab === 'lists' && <th>Tablero</th>}
                                            {activeTab === 'tasks' && <><th>Lista</th><th>Asignado</th></>}
                                            
                                            <th style={{textAlign:'right'}}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 && !loading ? (
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No hay datos disponibles.</td></tr>
                                        ) : (
                                            data.map(item => (
                                                <tr key={item.id}>
                                                    <td style={{opacity:0.7}}>#{item.id}</td>
                                                    <td>
                                                        <div style={{fontWeight:'bold'}}>{item.name || item.title || 'Sin Nombre'}</div>
                                                    </td>
                                                    
                                                    {/* Datos de Usuarios */}
                                                    {activeTab === 'users' && (
                                                        <>
                                                            <td>{item.email}</td>
                                                            <td><span className={`badge ${item.role}`}>{item.role}</span></td>
                                                        </>
                                                    )}

                                                    {/* Datos de Proyectos */}
                                                    {activeTab === 'boards' && (
                                                        <td>{item.user ? item.user.name : 'Desconocido'}</td>
                                                    )}

                                                    {/* Datos de Listas */}
                                                    {activeTab === 'lists' && (
                                                        <td>{item.board ? item.board.name : 'Sin Tablero'}</td>
                                                    )}

                                                    {/* Datos de Tareas */}
                                                    {activeTab === 'tasks' && (
                                                        <>
                                                            <td>{item.list ? item.list.title : '-'}</td>
                                                            <td>{item.user ? item.user.name : 'Sin asignar'}</td>
                                                        </>
                                                    )}

                                                    <td style={{textAlign:'right'}}>
                                                        {activeTab === 'users' && <button onClick={() => handleEdit(item)} className="action-icon"><FiEdit2/></button>}
                                                        <button onClick={() => requestDelete(item.id)} className="action-icon delete"><FiTrash2/></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
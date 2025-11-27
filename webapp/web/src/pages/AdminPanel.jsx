import React, { useState, useEffect } from 'react';
import client from '../api/axios';
import { 
    FiUsers, FiLogOut, FiEdit2, FiTrash2, 
    FiSave, FiRefreshCw, FiX, FiLayout, FiCheckSquare, 
    FiCheckCircle, FiAlertCircle, FiAlertTriangle 
} from 'react-icons/fi';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'boards', 'tasks'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    // Estados dinámicos para formulario
    const [formUser, setFormUser] = useState({ name: '', email: '', role: 'user', password: '' });
    const [formBoard, setFormBoard] = useState({ name: '', user_id: '' });
    
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
            if (activeTab === 'tasks') endpoint = '/tasks';

            const res = await client.get(endpoint);
            setData(res.data);
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setData([]);
        fetchData();
        setIsEditing(false);
        setFormUser({ name: '', email: '', role: 'user', password: '' });
        setFormBoard({ name: '', user_id: '' });
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            let endpoint = '';
            let payload = {};

            if (activeTab === 'users') {
                endpoint = '/users';
                payload = formUser;
            } else if (activeTab === 'boards') {
                endpoint = '/boards';
                payload = formBoard;
            } else {
                showToast("Crear tareas se hace desde el Tablero visual", "info");
                setProcessing(false);
                return;
            }

            if (isEditing) {
                await client.put(`${endpoint}/${editId}`, payload);
                showToast("Registro actualizado");
            } else {
                await client.post(endpoint, payload);
                showToast("Registro creado");
            }
            
            // Reset
            setFormUser({ name: '', email: '', role: 'user', password: '' });
            setFormBoard({ name: '', user_id: '' });
            setIsEditing(false);
            setEditId(null);
            fetchData();

        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            showToast("Error: " + msg, "error");
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
            setFormUser({ name: item.name, email: item.email, role: item.role, password: '' });
        } else if (activeTab === 'boards') {
            setFormBoard({ name: item.name, user_id: item.user_id });
        }
        setIsEditing(true);
        setEditId(item.id);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="app-container" style={{position: 'relative'}}>
            
            {toast.show && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                    background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : toast.type === 'info' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(239, 68, 68, 0.9)',
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
                        <p style={{marginBottom: '25px', opacity: 0.8}}>Se borrarán todos los datos relacionados.</p>
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                            <button onClick={() => setDeleteModal({ show: false, id: null })} style={{padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', cursor: 'pointer'}}>Cancelar</button>
                            <button onClick={confirmDelete} style={{padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold'}}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

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
                    <button onClick={() => setActiveTab('tasks')} className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} style={{background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:'1rem'}}>
                        <FiCheckSquare /> Tareas Globales
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
                        <h3>{activeTab === 'users' ? 'Usuarios' : activeTab === 'boards' ? 'Proyectos (Tableros)' : 'Tareas'}</h3>
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
                            <div><h3>{activeTab === 'boards' ? data.length : '-'}</h3><p>Proyectos</p></div>
                        </div>
                        <div className="card-stat">
                            <div className="stat-icon-bg"><FiCheckSquare/></div>
                            <div><h3>{activeTab === 'tasks' ? data.length : '-'}</h3><p>Tareas</p></div>
                        </div>
                    </div>

                    <div className="main-grid">
                        
                        {/* FORMULARIO DINÁMICO */}
                        {activeTab !== 'tasks' && (
                            <div className="panel-card form-panel">
                                <div className="panel-header">
                                    <h3>{isEditing ? 'Editar' : 'Nuevo'} {activeTab === 'users' ? 'Usuario' : 'Proyecto'}</h3>
                                    {isEditing && <button onClick={() => { setIsEditing(false); setFormUser({ name: '', email: '', role: 'user', password: '' }); setFormBoard({ name: '', user_id: '' }); }} style={{background:'none', border:'none', color:'red', cursor:'pointer'}}><FiX/></button>}
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    {/* CAMPOS PARA USUARIOS */}
                                    {activeTab === 'users' && (
                                        <>
                                            <div className="form-group">
                                                <label>Nombre</label>
                                                <input type="text" value={formUser.name} onChange={(e) => setFormUser({...formUser, name: e.target.value})} className="input-dark" required />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="email" value={formUser.email} onChange={(e) => setFormUser({...formUser, email: e.target.value})} className="input-dark" required />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group" style={{flex:1}}>
                                                    <label>Rol</label>
                                                    <select value={formUser.role} onChange={(e) => setFormUser({...formUser, role: e.target.value})} className="glass-select">
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div className="form-group" style={{flex:1}}>
                                                    <label>Password</label>
                                                    <input type="password" value={formUser.password} onChange={(e) => setFormUser({...formUser, password: e.target.value})} className="input-dark" placeholder={isEditing ? 'Opcional' : '***'} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* CAMPOS PARA BOARDS */}
                                    {activeTab === 'boards' && (
                                        <>
                                            <div className="form-group">
                                                <label>Nombre del Proyecto</label>
                                                <input type="text" value={formBoard.name} onChange={(e) => setFormBoard({...formBoard, name: e.target.value})} className="input-dark" placeholder="Ej: Rediseño Web" required />
                                            </div>
                                            <div className="form-group">
                                                <label>ID del Dueño (User ID)</label>
                                                <input type="number" value={formBoard.user_id} onChange={(e) => setFormBoard({...formBoard, user_id: e.target.value})} className="input-dark" placeholder="Ej: 1" required />
                                                <small style={{color:'rgba(255,255,255,0.5)', fontSize:'0.7rem'}}>Mira la tabla de usuarios para ver los ID.</small>
                                            </div>
                                        </>
                                    )}

                                    <button type="submit" className="yummy-button" disabled={processing}>
                                        {processing ? <FiRefreshCw className="spin"/> : <FiSave />} Guardar
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="panel-card table-panel" style={{ gridColumn: activeTab === 'tasks' ? '1 / -1' : 'auto' }}>
                            <div className="panel-header">
                                <h3>Registros</h3>
                                <button onClick={fetchData} className="action-icon"><FiRefreshCw className={loading ? 'spin' : ''}/></button>
                            </div>
                            
                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Detalle</th>
                                            <th>Info Extra</th>
                                            <th style={{textAlign:'right'}}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 && !loading ? (
                                            <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>Sin datos</td></tr>
                                        ) : (
                                            data.map(item => (
                                                <tr key={item.id}>
                                                    <td style={{opacity:0.7}}>#{item.id}</td>
                                                    <td>
                                                        <div style={{fontWeight:'bold'}}>{item.name || item.title}</div>
                                                        {activeTab === 'tasks' && <small style={{opacity:0.7}}>{item.description}</small>}
                                                    </td>
                                                    <td>
                                                        {activeTab === 'users' && <span>{item.email} <span className={`badge ${item.role}`}>{item.role}</span></span>}
                                                        {activeTab === 'boards' && <span>Dueño ID: {item.user_id}</span>}
                                                        {activeTab === 'tasks' && <span>Lista: {item.list?.title || 'N/A'}</span>}
                                                    </td>
                                                    <td style={{textAlign:'right'}}>
                                                        {activeTab !== 'tasks' && (
                                                            <button onClick={() => handleEdit(item)} className="action-icon"><FiEdit2/></button>
                                                        )}
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
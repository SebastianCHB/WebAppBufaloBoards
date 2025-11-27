import React, { useState, useEffect } from 'react';
import client from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
    FiLogOut, FiPlus, FiLayout, 
    FiTrash2, FiActivity, FiX, FiArrowRight, FiAlertTriangle
} from 'react-icons/fi';

export default function UserDashboard() {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Datos
    const [newBoardName, setNewBoardName] = useState('');
    const [boardToDelete, setBoardToDelete] = useState(null);
    const [processing, setProcessing] = useState(false);

    let user = { name: 'Usuario' };
    try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
    } catch(e) {}

    const fetchBoards = async () => {
        setLoading(true);
        try {
            const res = await client.get('/boards');
            // Filtrar por usuario actual si el backend devuelve todos
            const myBoards = res.data.filter(b => b.user_id === user.id);
            setBoards(myBoards);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoardName.trim()) return;
        setProcessing(true);
        try {
            await client.post('/boards', { name: newBoardName, user_id: user.id });
            setShowCreateModal(false);
            setNewBoardName('');
            fetchBoards();
        } catch (error) {
            alert("Error al crear");
        } finally {
            setProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!boardToDelete) return;
        setProcessing(true);
        try {
            await client.delete(`/boards/${boardToDelete}`);
            setBoards(boards.filter(b => b.id !== boardToDelete));
            setShowDeleteModal(false);
            setBoardToDelete(null);
        } catch (error) {
            alert("Error al eliminar");
        } finally {
            setProcessing(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="dashboard-layout">
            <nav className="glass-navbar">
                <div className="nav-logo" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <FiLayout size={24} color="var(--color-celestial)"/>
                    <span style={{fontWeight: '700', fontSize: '1.3rem', color: 'var(--text-light)'}}>BufaloBoards</span>
                </div>
                <button onClick={handleLogout} className="logout-btn-sidebar" style={{width:'auto'}}><FiLogOut/></button>
            </nav>

            <main className="dashboard-content" style={{background:'transparent', border:'none', boxShadow:'none'}}>
                <div style={{maxWidth:'1200px', margin:'0 auto'}}>
                    <h2 style={{color:'var(--text-light)', marginBottom:'30px', display:'flex', alignItems:'center', gap:'10px'}}>
                        <FiActivity/> Mis Proyectos
                    </h2>
                    
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'30px'}}>
                        
                        {/* CARD CREAR */}
                        <div onClick={() => setShowCreateModal(true)} style={{height:'200px', border:'2px dashed rgba(255,255,255,0.3)', borderRadius:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-light)', transition:'0.3s'}}
                             onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <FiPlus size={40} style={{marginBottom:'10px'}}/>
                            <span style={{fontWeight:'bold'}}>Crear Tablero</span>
                        </div>

                        {/* CARDS TABLEROS */}
                        {boards.map(board => (
                            <div key={board.id} onClick={() => navigate(`/board/${board.id}`)} 
                                 style={{height:'200px', background:'rgba(30, 50, 70, 0.6)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'25px', display:'flex', flexDirection:'column', justifyContent:'space-between', cursor:'pointer', position:'relative', boxShadow:'0 8px 32px rgba(0,0,0,0.2)', transition:'0.3s'}}
                                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                
                                <div>
                                    <h3 style={{color:'white', fontSize:'1.4rem'}}>{board.name}</h3>
                                    <small style={{color:'rgba(255,255,255,0.6)'}}>Creado: {new Date(board.created_at).toLocaleDateString()}</small>
                                </div>

                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span style={{color:'var(--color-light-blue)', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.9rem'}}>Abrir <FiArrowRight/></span>
                                    <button onClick={(e) => { e.stopPropagation(); setBoardToDelete(board.id); setShowDeleteModal(true); }} 
                                            style={{background:'rgba(255,100,100,0.1)', border:'none', padding:'8px', borderRadius:'8px', color:'#ff6b6b', cursor:'pointer'}}>
                                        <FiTrash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* MODAL CREAR */}
            {showCreateModal && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div className="glass-card" style={{animation:'slideIn 0.3s'}}>
                        <h3 style={{marginBottom:'20px'}}>Nuevo Proyecto</h3>
                        <form onSubmit={handleCreateBoard}>
                            <input type="text" className="glass-input" placeholder="Nombre del tablero" autoFocus value={newBoardName} onChange={e => setNewBoardName(e.target.value)} required />
                            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{flex:1, padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'white', borderRadius:'10px', cursor:'pointer'}}>Cancelar</button>
                                <button type="submit" className="yummy-button" style={{flex:1}} disabled={processing}>{processing ? 'Creando...' : 'Crear'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ELIMINAR (ESTILO ALERTA) */}
            {showDeleteModal && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div className="glass-card" style={{maxWidth:'400px', textAlign:'center', border:'1px solid rgba(255,100,100,0.3)', animation:'slideIn 0.3s'}}>
                        <FiAlertTriangle size={50} color="#ff6b6b" style={{marginBottom:'15px'}}/>
                        <h3 style={{marginBottom:'10px'}}>¿Eliminar Tablero?</h3>
                        <p style={{opacity:0.7, marginBottom:'25px'}}>Se borrarán todas las listas y tareas de este proyecto. No se puede deshacer.</p>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={() => setShowDeleteModal(false)} style={{flex:1, padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'white', borderRadius:'10px', cursor:'pointer'}}>Cancelar</button>
                            <button onClick={confirmDelete} style={{flex:1, padding:'12px', background:'#ff6b6b', border:'none', color:'white', borderRadius:'10px', cursor:'pointer', fontWeight:'bold'}} disabled={processing}>{processing ? '...' : 'Eliminar'}</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
    );
}
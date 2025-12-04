import React, { useState, useEffect } from 'react';
import client from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
    FiLogOut, FiPlus, FiLayout, 
    FiTrash2, FiActivity, FiX, FiArrowRight, 
    FiAlertTriangle, FiClock, FiUsers, FiUserCheck, FiUserMinus, FiEdit3 
} from 'react-icons/fi';

export default function UserDashboard() {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, boardId: null });
    const [leaveModal, setLeaveModal] = useState({ show: false, boardId: null });
    
    const [boardName, setBoardName] = useState('');
    const [editingBoardId, setEditingBoardId] = useState(null);
    const [processing, setProcessing] = useState(false);

    let user = { name: 'Usuario', id: 0 };
    try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
    } catch(e) {}

    const fetchBoards = async () => {
        setLoading(true);
        try {
            const res = await client.get('/boards');
            setBoards(res.data);
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
        if (!boardName.trim()) return;
        setProcessing(true);
        try {
            await client.post('/boards', { name: boardName, user_id: user.id });
            setShowCreateModal(false);
            setBoardName('');
            fetchBoards();
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleEditClick = (e, board) => {
        e.stopPropagation();
        setBoardName(board.name);
        setEditingBoardId(board.id);
        setShowEditModal(true);
    };

    const handleUpdateBoard = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await client.put(`/boards/${editingBoardId}`, { name: boardName });
            setShowEditModal(false);
            setBoardName('');
            setEditingBoardId(null);
            fetchBoards();
        } catch (error) {
            alert("Error al actualizar");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteClick = (e, boardId) => {
        e.stopPropagation();
        setDeleteModal({ show: true, boardId });
    };

    const handleLeaveClick = (e, boardId) => {
        e.stopPropagation();
        setLeaveModal({ show: true, boardId });
    };

    const confirmDelete = async () => {
        if (!deleteModal.boardId) return;
        setProcessing(true);
        try {
            await client.delete(`/boards/${deleteModal.boardId}`);
            setBoards(boards.filter(b => b.id !== deleteModal.boardId));
            setDeleteModal({ show: false, boardId: null });
        } catch (error) {
            alert("No se pudo eliminar");
        } finally {
            setProcessing(false);
        }
    };

    const confirmLeave = async () => {
        if (!leaveModal.boardId) return;
        setProcessing(true);
        try {
            await client.post(`/boards/${leaveModal.boardId}/leave`);
            setBoards(boards.filter(b => b.id !== leaveModal.boardId));
            setLeaveModal({ show: false, boardId: null });
        } catch (error) {
            alert("Error al abandonar");
        } finally {
            setProcessing(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    if (loading) return (
        <div style={{height: '100vh', display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e3a8a, #0f172a)'}}>
            <div style={{display:'flex', gap:'10px'}}>
                <div style={{width:'15px', height:'15px', background:'#3b82f6', borderRadius:'50%', animation:'pulse 1s infinite alternate'}}></div>
                <div style={{width:'15px', height:'15px', background:'#60a5fa', borderRadius:'50%', animation:'pulse 1s infinite 0.2s alternate'}}></div>
                <div style={{width:'15px', height:'15px', background:'#93c5fd', borderRadius:'50%', animation:'pulse 1s infinite 0.4s alternate'}}></div>
            </div>
            <style>{`@keyframes pulse { from { transform: scale(1); opacity: 1; } to { transform: scale(1.5); opacity: 0.5; } }`}</style>
        </div>
    );

    return (
        <div className="dashboard-layout" style={{background: 'radial-gradient(circle at top right, #1e3a8a, #0f172a)', minHeight: '100vh', color: 'white'}}>
            <nav className="glass-navbar" style={{background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <div className="nav-logo" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', padding: '8px', borderRadius: '12px', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'}}>
                         <FiLayout size={24} color="white" />
                    </div>
                    <span style={{fontWeight: '800', fontSize: '1.4rem', letterSpacing:'-0.5px'}}>BufaloBoards</span>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                     <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '5px 15px 5px 5px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)'}}>
                        <div style={{width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(to right, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{fontSize: '0.9rem', fontWeight: 500}}>{user.name.split(' ')[0]}</span>
                     </div>
                    <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '8px', transition: '0.3s'}}>
                        <FiLogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="dashboard-content" style={{padding:'40px', background: 'transparent', border: 'none', boxShadow: 'none'}}>
                <div style={{maxWidth: '1400px', margin: '0 auto'}}>
                    <div style={{marginBottom: '40px', display:'flex', justifyContent:'space-between', alignItems:'end'}}>
                        <div>
                            <h2 style={{fontSize: '2.5rem', fontWeight:'700', marginBottom:'10px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                               Mis Proyectos
                            </h2>
                            <p style={{color: '#94a3b8', fontSize: '1.1rem'}}>Organiza tus ideas y colabora con tu equipo.</p>
                        </div>
                    </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px'}}>
                        
                        <div onClick={() => { setBoardName(''); setShowCreateModal(true); }} 
                            style={{height: '240px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s', background: 'rgba(255,255,255,0.02)'}}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        >
                            <div style={{background: '#3b82f6', padding: '15px', borderRadius: '50%', marginBottom:'15px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'}}>
                                <FiPlus size={30} color="white" />
                            </div>
                            <span style={{fontWeight: 600, fontSize: '1.1rem', color: '#e2e8f0'}}>Crear Nuevo Tablero</span>
                        </div>

                        {boards.map(board => {
                            const isOwner = board.user_id === user.id;
                            return (
                                <div key={board.id} onClick={() => navigate(`/board/${board.id}`)} 
                                    style={{
                                        height: '240px', 
                                        background: 'rgba(30, 41, 59, 0.7)', 
                                        backdropFilter: 'blur(10px)', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '24px', padding: '30px', 
                                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', 
                                        cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                        position: 'relative', overflow: 'hidden',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                                >
                                    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: isOwner ? 'linear-gradient(90deg, #3b82f6, #06b6d4)' : 'linear-gradient(90deg, #db2777, #f472b6)'}}></div>
                                    
                                    <div>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'15px'}}>
                                            {isOwner ? (
                                                <span style={{background:'rgba(59, 130, 246, 0.2)', padding:'4px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'bold', color:'#60a5fa', display:'flex', alignItems:'center', gap:'5px', letterSpacing:'0.5px'}}>
                                                    <FiUserCheck size={12}/> PROPIETARIO
                                                </span>
                                            ) : (
                                                <span style={{background:'rgba(219, 39, 119, 0.2)', padding:'4px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'bold', color:'#f472b6', display:'flex', alignItems:'center', gap:'5px', letterSpacing:'0.5px'}}>
                                                    <FiUsers size={12}/> INVITADO
                                                </span>
                                            )}
                                            
                                            {isOwner && (
                                                <button onClick={(e) => handleEditClick(e, board)} style={{background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', padding:'5px', transition:'0.2s'}} title="Editar nombre">
                                                    <FiEdit3 size={16}/>
                                                </button>
                                            )}
                                        </div>

                                        <h3 style={{color: 'white', fontSize: '1.6rem', marginBottom: '10px', fontWeight:'700', lineHeight:'1.2'}}>{board.name}</h3>
                                        
                                        {!isOwner && <small style={{color:'#94a3b8', display:'block', marginBottom:'5px'}}>De: {board.user?.name}</small>}
                                        
                                        <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#64748b', fontSize:'0.85rem'}}>
                                            <FiClock size={14}/> {new Date(board.created_at).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>

                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px'}}>
                                        <span style={{fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight:'600'}}>
                                            Entrar <FiArrowRight size={16} />
                                        </span>
                                        
                                        {isOwner ? (
                                            <button onClick={(e) => handleDeleteClick(e, board.id)} style={{background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', padding: '8px', color: '#ef4444', cursor: 'pointer', transition: '0.2s'}} title="Eliminar proyecto">
                                                <FiTrash2 size={18}/>
                                            </button>
                                        ) : (
                                            <button onClick={(e) => handleLeaveClick(e, board.id)} style={{background: 'rgba(234, 179, 8, 0.1)', border: 'none', borderRadius: '8px', padding: '8px', color: '#eab308', cursor: 'pointer', transition: '0.2s'}} title="Salir del proyecto">
                                                <FiUserMinus size={18}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {(showCreateModal || showEditModal) && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="glass-card" style={{maxWidth: '450px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', width: '90%', animation: 'slideIn 0.3s ease-out'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                            <h3 style={{fontSize:'1.5rem', fontWeight:'700', color:'white'}}>{showEditModal ? 'Renombrar Proyecto' : 'Nuevo Proyecto'}</h3>
                            <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:'5px'}}><FiX size={24}/></button>
                        </div>
                        
                        <form onSubmit={showEditModal ? handleUpdateBoard : handleCreateBoard}>
                            <div className="form-group">
                                <label style={{color: '#94a3b8', marginBottom:'10px', display:'block', fontSize:'0.9rem', fontWeight:'500'}}>Título del Tablero</label>
                                <input 
                                    type="text" 
                                    value={boardName} 
                                    onChange={(e) => setBoardName(e.target.value)} 
                                    autoFocus required 
                                    placeholder={showEditModal ? "Nuevo nombre..." : "Ej: Lanzamiento Web"}
                                    style={{width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1.1rem', outline: 'none', transition: '0.2s'}}
                                />
                            </div>
                            <div style={{display:'flex', gap:'10px', marginTop:'30px'}}>
                                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} style={{flex:1, padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#cbd5e1', borderRadius:'12px', cursor:'pointer', fontWeight:'600'}}>Cancelar</button>
                                <button type="submit" disabled={processing} style={{flex:1, padding:'12px', background: 'linear-gradient(to right, #3b82f6, #2563eb)', border:'none', color:'white', borderRadius:'12px', cursor:'pointer', fontWeight:'600', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'}}>
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {(deleteModal.show || leaveModal.show) && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.85)', backdropFilter:'blur(5px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div className="glass-card" style={{maxWidth:'400px', textAlign:'center', border:'1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)', borderRadius:'24px', padding:'40px', width:'90%', animation:'slideIn 0.3s'}}>
                        <div style={{background: deleteModal.show ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)', width:'80px', height:'80px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                            <FiAlertTriangle size={40} color={deleteModal.show ? '#ef4444' : '#eab308'} />
                        </div>
                        <h3 style={{marginBottom:'10px', fontSize:'1.5rem', fontWeight:'700', color:'white'}}>{deleteModal.show ? '¿Eliminar Proyecto?' : '¿Salir del Proyecto?'}</h3>
                        <p style={{color:'#94a3b8', marginBottom:'30px', lineHeight:'1.5'}}>{deleteModal.show ? 'Esta acción borrará todas las listas y tareas permanentemente.' : 'Perderás el acceso a este tablero hasta que te inviten nuevamente.'}</p>
                        
                        <div style={{display:'flex', gap:'15px'}}>
                            <button onClick={() => { setDeleteModal({show:false}); setLeaveModal({show:false}); }} style={{flex:1, padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'white', borderRadius:'12px', cursor:'pointer', fontWeight:'600'}}>Cancelar</button>
                            <button onClick={deleteModal.show ? confirmDelete : confirmLeave} style={{flex:1, padding:'12px', background: deleteModal.show ? '#ef4444' : '#eab308', border:'none', color: deleteModal.show ? 'white' : 'black', borderRadius:'12px', cursor:'pointer', fontWeight:'700'}}>
                                {deleteModal.show ? 'Eliminar' : 'Salir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
    );
}
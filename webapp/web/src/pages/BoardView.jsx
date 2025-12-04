import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
    FiArrowLeft, FiPlus, FiTrash2, FiX, 
    FiUserPlus, FiUser, FiPaperclip, FiDownload, FiFile, FiAlertTriangle, FiCheckCircle, FiAlignLeft, FiSave 
} from 'react-icons/fi';

export default function BoardView() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [members, setMembers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskDescription, setTaskDescription] = useState('');
    
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [activeListId, setActiveListId] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [uploading, setUploading] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null, parentId: null });

    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchBoardData = async () => {
        try {
            const res = await client.get(`/boards/${id}`);
            setBoard(res.data);
            setLists(res.data.lists || []);
            setMembers(res.data.members || []);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = '/';
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardData();
    }, [id]);

    const showToast = (message) => {
        setToast({ show: true, message, type: 'success' });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const showError = (msg) => {
        setErrorModal({ show: true, message: msg });
    };

    const handleCreateTask = async (listId) => {
        if (!newTaskTitle.trim()) return;
        setProcessing(true);
        try {
            const res = await client.post('/tasks', {
                title: newTaskTitle,
                list_id: listId,
                position: 9999
            });
            const newTask = { ...res.data, files: [] };
            const updatedLists = lists.map(list => {
                if (list.id === listId) {
                    return { ...list, tasks: [...list.tasks, newTask] };
                }
                return list;
            });
            setLists(updatedLists);
            setNewTaskTitle('');
            setActiveListId(null);
        } catch (error) {
            showError("No se pudo crear la tarea.");
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateDescription = async () => {
        if (!selectedTask) return;
        setProcessing(true);
        try {
            const res = await client.put(`/tasks/${selectedTask.id}`, {
                title: selectedTask.title,
                list_id: selectedTask.list_id,
                description: taskDescription
            });
            const updatedTask = { ...selectedTask, description: res.data.description };
            setSelectedTask(updatedTask);
            const updatedLists = lists.map(list => ({
                ...list,
                tasks: list.tasks.map(t => t.id === selectedTask.id ? { ...t, description: res.data.description } : t)
            }));
            setLists(updatedLists);
            showToast("Descripción guardada");
        } catch (error) {
            showError("Error al guardar descripción");
        } finally {
            setProcessing(false);
        }
    };

    const requestDeleteTask = (e, taskId, listId) => {
        e.stopPropagation();
        setDeleteConfirm({ show: true, type: 'task', id: taskId, parentId: listId });
    };

    const requestDeleteFile = (fileId) => {
        setDeleteConfirm({ show: true, type: 'file', id: fileId });
    };

    const confirmDeleteAction = async () => {
        if (!deleteConfirm.id) return;
        setProcessing(true);
        try {
            if (deleteConfirm.type === 'task') {
                await client.delete(`/tasks/${deleteConfirm.id}`);
                const updatedLists = lists.map(list => {
                    if (list.id === deleteConfirm.parentId) {
                        return { ...list, tasks: list.tasks.filter(t => t.id !== deleteConfirm.id) };
                    }
                    return list;
                });
                setLists(updatedLists);
                if (selectedTask?.id === deleteConfirm.id) closeTaskModal();
            } else if (deleteConfirm.type === 'file') {
                await client.delete(`/files/${deleteConfirm.id}`);
                const updatedTask = { 
                    ...selectedTask, 
                    files: selectedTask.files.filter(f => f.id !== deleteConfirm.id) 
                };
                setSelectedTask(updatedTask);
                const updatedLists = lists.map(list => ({
                    ...list,
                    tasks: list.tasks.map(t => t.id === selectedTask.id ? updatedTask : t)
                }));
                setLists(updatedLists);
            }
            showToast("Eliminado correctamente");
        } catch (error) {
            showError("No se pudo eliminar.");
        } finally {
            setDeleteConfirm({ show: false, type: null, id: null, parentId: null });
            setProcessing(false);
        }
    };

    const openTaskModal = (task) => {
        setSelectedTask(task);
        setTaskDescription(task.description || '');
        setTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setTaskModalOpen(false);
        setSelectedTask(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedTask) return;

        if (file.size > 5 * 1024 * 1024) {
            showError("El archivo es demasiado grande (Máx 5MB).");
            e.target.value = null;
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('task_id', selectedTask.id);

        setUploading(true);
        try {
            const res = await client.post('/files', formData, {
                headers: { 'Content-Type': undefined }
            });

            const newFile = res.data;
            const updatedTask = { ...selectedTask, files: [...(selectedTask.files || []), newFile] };
            setSelectedTask(updatedTask);
            const updatedLists = lists.map(list => ({
                ...list,
                tasks: list.tasks.map(t => t.id === selectedTask.id ? updatedTask : t)
            }));
            setLists(updatedLists);
            showToast("Archivo subido");
        } catch (error) {
            console.error(error);
            showError("Error al subir archivo");
        } finally {
            setUploading(false);
            e.target.value = null; 
        }
    };

    const handleDownload = async (file) => {
        try {
            const response = await client.get(`/files/${file.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            showError("No se pudo descargar el archivo.");
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await client.post(`/boards/${id}/invite`, { email: inviteEmail });
            setInviteEmail('');
            setShowInvite(false);
            showToast("Usuario invitado exitosamente");
            fetchBoardData();
        } catch (error) {
            const msg = error.response?.data?.message || "Ocurrió un error al invitar";
            showError(msg);
        } finally {
            setProcessing(false);
        }
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newLists = [...lists];
        const sourceList = newLists.find(l => l.id.toString() === source.droppableId);
        const destList = newLists.find(l => l.id.toString() === destination.droppableId);

        if (!sourceList || !destList) return;

        const [movedTask] = sourceList.tasks.splice(source.index, 1);
        
        let shouldAssign = false;
        if (destList.title !== 'PENDIENTE' && !movedTask.user_id) {
            movedTask.user_id = currentUser.id;
            movedTask.user = currentUser;
            shouldAssign = true;
        }

        destList.tasks.splice(destination.index, 0, movedTask);
        setLists(newLists);

        try {
            const payload = { list_id: destList.id, position: destination.index + 1 };
            if (shouldAssign) payload.assign_user_id = currentUser.id;
            await client.put(`/tasks/${draggableId}/move`, payload);
        } catch (error) {
            console.error(error);
        }
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
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at bottom right, #1e3a8a, #0f172a)', overflow: 'hidden'}}>
            
            {(loading || processing || uploading) && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'4px', background:'rgba(255,255,255,0.1)', zIndex:9999}}>
                    <div style={{height:'100%', background:'var(--color-celestial)', width:'100%', animation:'indeterminate 1.5s infinite linear', transformOrigin: '0% 50%'}}></div>
                </div>
            )}

            <style>{`
                @keyframes indeterminate {
                    0% { transform:  translateX(0) scaleX(0); }
                    40% { transform:  translateX(0) scaleX(0.4); }
                    100% { transform:  translateX(100%) scaleX(0.5); }
                }
                @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <nav className="glass-navbar" style={{flexShrink: 0, height: '70px', padding: '0 30px', zIndex: 10, justifyContent: 'space-between', display:'flex', alignItems:'center', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                    <button onClick={() => navigate('/dashboard')} style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', padding: '8px 15px', borderRadius: '12px', transition: '0.2s'}} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}>
                        <FiArrowLeft /> Dashboard
                    </button>
                    <div style={{height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)'}}></div>
                    <h2 style={{color: 'white', fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '0.5px'}}>{board?.name}</h2>
                </div>

                <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                    <div style={{display:'flex'}}>
                        {members.map((member, index) => (
                            <div key={member.id} title={member.name} style={{
                                width:'35px', height:'35px', borderRadius:'50%', 
                                background: member.id === currentUser.id ? '#3b82f6' : '#64748b', 
                                border:'3px solid #0f172a',
                                color:'white', display:'flex', alignItems:'center', justifyContent:'center', 
                                fontSize:'0.9rem', fontWeight:'bold', marginLeft: index > 0 ? '-12px' : '0',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                            }}>
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setShowInvite(!showInvite)} style={{background: 'linear-gradient(to right, #3b82f6, #2563eb)', border:'none', borderRadius:'12px', padding:'8px 18px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', fontWeight:'600', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'}}>
                        <FiUserPlus /> Invitar
                    </button>
                </div>
            </nav>

            {showInvite && (
                <div style={{position:'absolute', top:'75px', right:'30px', background:'rgba(15, 23, 42, 0.95)', padding:'20px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)', zIndex:20, width:'320px', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', animation: 'slideIn 0.2s'}}>
                    <h4 style={{color:'white', marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}><FiUserPlus/> Invitar al equipo</h4>
                    <form onSubmit={handleInvite} style={{display:'flex', gap:'8px'}}>
                        <input type="email" placeholder="correo@ejemplo.com" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.3)', color:'white', outline:'none'}} required/>
                        <button type="submit" style={{background:'#3b82f6', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', padding:'0 15px', fontWeight:'bold'}}>Enviar</button>
                    </form>
                </div>
            )}

            <div style={{flex: 1, overflow: 'hidden', padding: '30px'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', height: '100%', width: '100%'}}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        {lists.map(list => (
                            <div key={list.id} style={{background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}>
                                
                                <div style={{padding: '5px 5px 15px 5px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px'}}>
                                    <span style={{fontWeight: '700', color: 'white', fontSize: '1rem', letterSpacing: '0.5px'}}>{list.title}</span>
                                    <span style={{background:'rgba(255,255,255,0.1)', borderRadius:'12px', padding:'2px 8px', fontSize:'0.75rem', color: '#94a3b8', fontWeight: '600'}}>{list.tasks?.length || 0}</span>
                                </div>

                                <Droppable droppableId={list.id.toString()}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} 
                                            style={{
                                                flex: 1, overflowY: 'auto', 
                                                background: snapshot.isDraggingOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent', 
                                                transition: 'background 0.2s', padding: '5px', borderRadius: '12px'
                                            }} 
                                            className="custom-scrollbar"
                                        >
                                            {(list.tasks || []).map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => openTaskModal(task)} 
                                                            style={{
                                                                userSelect: 'none', padding: '16px', margin: '0 0 12px 0', 
                                                                background: 'rgba(255, 255, 255, 0.95)', 
                                                                color: '#1e293b', borderRadius: '12px', 
                                                                boxShadow: snapshot.isDragging ? '0 15px 30px rgba(0,0,0,0.4)' : '0 2px 5px rgba(0,0,0,0.1)', 
                                                                transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
                                                                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                                                                borderLeft: `4px solid ${task.user_id ? '#3b82f6' : '#cbd5e1'}`,
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div style={{marginBottom:'10px', fontWeight: '500', fontSize: '0.95rem', lineHeight:'1.4'}}>{task.title}</div>
                                                            
                                                            {task.description && <div style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px'}}><FiAlignLeft size={12}/> Descripción</div>}

                                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #e2e8f0', paddingTop:'10px'}}>
                                                                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                                                    {task.user ? (
                                                                        <div title={`Asignado a: ${task.user.name}`} style={{width:'26px', height:'26px', borderRadius:'50%', background:'#3b82f6', color:'white', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', border:'2px solid white'}}>{task.user.name.charAt(0).toUpperCase()}</div>
                                                                    ) : (
                                                                        <div style={{width:'26px', height:'26px', borderRadius:'50%', border:'1px dashed #94a3b8', display:'flex', alignItems:'center', justifyContent:'center'}}><FiUser size={12} color="#94a3b8"/></div>
                                                                    )}
                                                                    {task.files && task.files.length > 0 && <span style={{display:'flex', alignItems:'center', gap:'2px', fontSize:'0.75rem', color:'#64748b', background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px'}}><FiPaperclip size={10}/> {task.files.length}</span>}
                                                                </div>
                                                                <button type="button" onClick={(e) => requestDeleteTask(e, task.id, list.id)} style={{border:'none', background:'transparent', color:'#ef4444', cursor:'pointer', opacity:0.6, padding:'5px', borderRadius:'5px'}} onMouseEnter={e => e.target.style.background='#fee2e2'} onMouseLeave={e => e.target.style.background='transparent'}><FiTrash2 size={14}/></button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                {activeListId === list.id ? (
                                    <div style={{marginTop: '10px', flexShrink: 0, background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px'}}>
                                        <textarea autoFocus placeholder="Título de la tarea..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateTask(list.id); }}} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'none', resize:'none', marginBottom:'10px', fontFamily:'inherit', background: '#334155', color: 'white', outline: 'none'}} />
                                        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                            <button onClick={() => handleCreateTask(list.id)} style={{padding:'8px 15px', fontSize:'0.85rem', background: '#3b82f6', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>Añadir</button>
                                            <button onClick={() => setActiveListId(null)} style={{background:'transparent', border:'none', cursor:'pointer', color:'#94a3b8'}}><FiX size={20}/></button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setActiveListId(list.id)} style={{flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', marginTop: '10px', fontSize: '0.9rem', transition: '0.2s'}} onMouseEnter={e => {e.target.style.background='rgba(255,255,255,0.1)'; e.target.style.color='white'}} onMouseLeave={e => {e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.color='#94a3b8'}}>
                                        <FiPlus /> Añadir tarjeta
                                    </button>
                                )}
                            </div>
                        ))}
                    </DragDropContext>
                </div>
            </div>

            {taskModalOpen && selectedTask && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div className="glass-card" style={{maxWidth:'600px', width:'90%', maxHeight:'85vh', overflowY:'auto', background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', padding:'30px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'20px'}}>
                            <div>
                                <h3 style={{color:'white', fontSize:'1.6rem', fontWeight:'700', lineHeight:'1.2'}}>{selectedTask.title}</h3>
                                <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'15px'}}>
                                    <span style={{color:'#94a3b8', fontSize:'0.85rem'}}>En lista: <strong style={{color:'white'}}>{lists.find(l => l.tasks.some(t => t.id === selectedTask.id))?.title}</strong></span>
                                    {selectedTask.user && <div style={{display:'flex', alignItems:'center', gap:'5px', background:'rgba(59, 130, 246, 0.1)', padding:'4px 10px', borderRadius:'20px'}}><FiUser color="#60a5fa" size={14}/> <span style={{color:'#93c5fd', fontSize:'0.8rem', fontWeight:'600'}}>{selectedTask.user.name}</span></div>}
                                </div>
                            </div>
                            <button onClick={closeTaskModal} style={{background:'rgba(255,255,255,0.05)', border:'none', color:'white', cursor:'pointer', padding:'8px', borderRadius:'8px'}}><FiX size={20}/></button>
                        </div>

                        <div style={{marginBottom:'30px'}}>
                            <h4 style={{color:'#94a3b8', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px'}}><FiAlignLeft /> Descripción</h4>
                            <textarea placeholder="Añadir una descripción detallada..." value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} style={{width:'100%', minHeight:'100px', padding:'15px', borderRadius:'12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)', color:'white', resize:'vertical', fontFamily:'inherit', lineHeight:'1.5', fontSize:'0.95rem', outline:'none'}} />
                            <button onClick={handleUpdateDescription} style={{marginTop:'15px', padding:'8px 20px', background:'#3b82f6', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px'}}><FiSave /> Guardar</button>
                        </div>

                        <div style={{marginTop:'30px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'25px'}}>
                            <h4 style={{color:'#94a3b8', marginBottom:'15px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px'}}><FiPaperclip /> Adjuntos</h4>
                            {selectedTask.files && selectedTask.files.length > 0 ? (
                                <div style={{display:'grid', gap:'12px'}}>
                                    {selectedTask.files.map(file => (
                                        <div key={file.id} style={{background:'rgba(255,255,255,0.03)', padding:'12px 15px', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid rgba(255,255,255,0.05)'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'12px', overflow:'hidden'}}><div style={{background:'#334155', padding:'8px', borderRadius:'8px'}}><FiFile color="#94a3b8"/></div><span style={{color:'white', fontSize:'0.95rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{file.file_name}</span></div>
                                            <div style={{display:'flex', gap:'10px'}}>
                                                <button onClick={() => handleDownload(file)} style={{background:'rgba(59, 130, 246, 0.1)', border:'none', color:'#60a5fa', cursor:'pointer', padding:'8px', borderRadius:'8px'}} title="Descargar"><FiDownload size={16}/></button>
                                                <button onClick={() => setDeleteConfirm({show:true, type:'file', id:file.id})} style={{background:'rgba(239, 68, 68, 0.1)', border:'none', color:'#f87171', cursor:'pointer', padding:'8px', borderRadius:'8px'}} title="Borrar"><FiTrash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p style={{color:'#64748b', fontStyle:'italic', fontSize:'0.9rem', background:'rgba(0,0,0,0.2)', padding:'15px', borderRadius:'12px', textAlign:'center'}}>No hay archivos adjuntos.</p>)}
                            
                            <div style={{marginTop:'25px'}}>
                                <label style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', background: uploading ? '#475569' : 'rgba(255,255,255,0.05)', color: uploading ? '#94a3b8' : 'white', padding:'15px', borderRadius:'12px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize:'0.95rem', border: '1px dashed rgba(255,255,255,0.2)', transition:'0.2s'}} onMouseEnter={e => !uploading && (e.currentTarget.style.background='rgba(255,255,255,0.1)')} onMouseLeave={e => !uploading && (e.currentTarget.style.background='rgba(255,255,255,0.05)')}>
                                    {uploading ? 'Subiendo archivo...' : <><FiPlus /> Subir Archivo</>}
                                    <input type="file" onChange={handleFileUpload} style={{display:'none'}} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm.show && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div className="glass-card" style={{maxWidth:'400px', textAlign:'center', border:'1px solid rgba(239, 68, 68, 0.3)', background: '#1e293b', borderRadius:'24px', padding:'40px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)', animation:'slideIn 0.3s'}}>
                        <div style={{background: 'rgba(239, 68, 68, 0.1)', width:'70px', height:'70px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                            <FiAlertTriangle size={35} color="#ef4444" />
                        </div>
                        <h3 style={{marginBottom:'10px', color:'white', fontSize:'1.4rem'}}>¿Eliminar elemento?</h3>
                        <p style={{opacity:0.7, marginBottom:'25px', color:'#94a3b8'}}>Esta acción es irreversible.</p>
                        <div style={{display:'flex', gap:'15px'}}>
                            <button onClick={() => setDeleteConfirm({show:false, type:null, id:null, parentId:null})} style={{flex:1, padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'white', borderRadius:'10px', cursor:'pointer', fontWeight:'600'}}>Cancelar</button>
                            <button onClick={confirmDeleteAction} style={{flex:1, padding:'12px', background:'#ef4444', border:'none', color:'white', borderRadius:'10px', cursor:'pointer', fontWeight:'bold'}}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {errorModal.show && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div className="glass-card" style={{maxWidth:'400px', textAlign:'center', border:'1px solid #fca5a5', background: '#1e293b', borderRadius:'24px', padding:'30px', animation:'slideIn 0.3s'}}>
                        <FiAlertTriangle size={40} color="#fca5a5" style={{marginBottom:'15px'}}/>
                        <h3 style={{marginBottom:'10px', color:'#fca5a5'}}>Algo salió mal</h3>
                        <p style={{color:'#e2e8f0', marginBottom:'25px', lineHeight:'1.5'}}>{errorModal.message}</p>
                        <button onClick={() => setErrorModal({show:false, message:''})} style={{padding:'10px 30px', background:'#3b82f6', border:'none', color:'white', borderRadius:'10px', cursor:'pointer', fontWeight:'bold'}}>Entendido</button>
                    </div>
                </div>
            )}

            {toast.show && (
                <div style={{
                    position: 'fixed', top: '30px', right: '30px', zIndex: 4000,
                    background: '#10b981', color: 'white', padding: '15px 25px', borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    animation: 'slideIn 0.3s ease-out', fontWeight:'600'
                }}>
                    <FiCheckCircle size={24}/>
                    <span>{toast.message}</span>
                </div>
            )}
            <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
    );
}   
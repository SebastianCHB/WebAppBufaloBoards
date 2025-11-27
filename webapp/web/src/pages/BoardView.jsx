import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiArrowLeft, FiPlus, FiMoreHorizontal, FiTrash2, FiX } from 'react-icons/fi';

export default function BoardView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [activeListId, setActiveListId] = useState(null);

    const fetchBoardData = async () => {
        try {
            const res = await client.get(`/boards/${id}`);
            setBoard(res.data);
            setLists(res.data.lists || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardData();
    }, [id]);

    const handleCreateTask = async (listId) => {
        if (!newTaskTitle.trim()) return;
        try {
            const res = await client.post('/tasks', {
                title: newTaskTitle,
                list_id: listId,
                position: 9999 
            });
            
            const updatedLists = lists.map(list => {
                if (list.id === listId) {
                    const currentTasks = list.tasks || [];
                    return { ...list, tasks: [...currentTasks, res.data] };
                }
                return list;
            });
            setLists(updatedLists);
            setNewTaskTitle('');
            setActiveListId(null);
        } catch (error) {
            alert("Error al crear tarea");
        }
    };

    const handleDeleteTask = async (taskId, listId) => {
        if(!window.confirm("¿Borrar tarea?")) return;
        try {
            await client.delete(`/tasks/${taskId}`);
             const updatedLists = lists.map(list => {
                if (list.id === listId) {
                    return { ...list, tasks: list.tasks.filter(t => t.id !== taskId) };
                }
                return list;
            });
            setLists(updatedLists);
        } catch (error) {
            alert("Error al eliminar");
        }
    }

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newLists = [...lists];
        const sourceList = newLists.find(l => l.id.toString() === source.droppableId);
        const destList = newLists.find(l => l.id.toString() === destination.droppableId);

        if (!sourceList || !destList) return;

        if (!sourceList.tasks) sourceList.tasks = [];
        if (!destList.tasks) destList.tasks = [];

        const [movedTask] = sourceList.tasks.splice(source.index, 1);
        destList.tasks.splice(destination.index, 0, movedTask);

        setLists(newLists);

        try {
            await client.put(`/tasks/${draggableId}/move`, {
                list_id: destList.id,
                position: destination.index + 1
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div style={{padding:'50px', color:'white', textAlign:'center'}}>Cargando...</div>;

    return (
        <div className="app-container" style={{flexDirection: 'column', overflow: 'hidden'}}>
            
            <nav className="glass-navbar" style={{height: '60px', padding: '0 20px', zIndex: 10}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                    <button onClick={() => navigate('/dashboard')} style={{background: 'transparent', border: 'none', color: 'var(--color-ice-white)', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem'}}>
                        <FiArrowLeft /> Volver
                    </button>
                    <div style={{height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)'}}></div>
                    <h2 style={{color: 'white', fontSize: '1.2rem', fontWeight: 'bold', margin: 0}}>{board?.name}</h2>
                </div>
            </nav>

            <div style={{flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    {lists.map(list => (
                        <div key={list.id} style={{
                            minWidth: '280px', width: '280px',
                            background: 'rgba(19, 41, 61, 0.4)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '12px',
                            display: 'flex', flexDirection: 'column',
                            maxHeight: '100%'
                        }}>
                            <div style={{padding: '0 5px 12px 5px', fontWeight: '600', color: 'var(--color-ice-white)', fontSize: '0.95rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                {list.title}
                                <FiMoreHorizontal style={{cursor:'pointer', opacity:0.7}}/>
                            </div>

                            <Droppable droppableId={list.id.toString()}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            flex: 1, minHeight: '20px', overflowY: 'auto',
                                            background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            transition: 'background 0.2s', 
                                            padding: '4px',
                                            borderRadius: '8px'
                                        }}
                                        className="custom-scrollbar"
                                    >
                                        {(list.tasks || []).map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            userSelect: 'none',
                                                            padding: '12px', margin: '0 0 8px 0',
                                                            background: 'rgba(234, 242, 243, 0.9)',
                                                            color: 'var(--color-prussian)',
                                                            borderRadius: '8px',
                                                            boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)',
                                                            fontSize: '0.9rem',
                                                            ...provided.draggableProps.style
                                                        }}
                                                    >
                                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                                            <span style={{wordBreak: 'break-word'}}>{task.title}</span>
                                                            <button onClick={()=>handleDeleteTask(task.id, list.id)} style={{border:'none', background:'transparent', color:'#ff6b6b', cursor:'pointer', opacity:0.6, marginLeft:'5px'}}>
                                                                <FiTrash2 size={12}/>
                                                            </button>
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
                                <div style={{marginTop: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>
                                    <textarea 
                                        autoFocus
                                        placeholder="Título de la tarea..."
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                        onKeyDown={e => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleCreateTask(list.id);
                                            }
                                        }}
                                        style={{
                                            width:'100%', padding:'8px', borderRadius:'6px', border:'none', 
                                            resize:'none', marginBottom:'8px', fontFamily:'inherit',
                                            background: 'rgba(255,255,255,0.9)', color: 'var(--text-dark)'
                                        }}
                                    />
                                    <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                        <button onClick={() => handleCreateTask(list.id)} className="yummy-button" style={{padding:'6px 12px', fontSize:'0.8rem', width:'auto'}}>Añadir</button>
                                        <button onClick={() => setActiveListId(null)} style={{background:'transparent', border:'none', cursor:'pointer', color:'white', opacity:0.7}}><FiX size={20}/></button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setActiveListId(list.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: 'transparent', border: 'none',
                                        color: 'var(--color-light-blue)', padding: '10px 5px', borderRadius: '8px',
                                        cursor: 'pointer', textAlign: 'left', marginTop: '5px',
                                        fontSize: '0.9rem'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <FiPlus /> Añadir tarjeta
                                </button>
                            )}
                        </div>
                    ))}
                </DragDropContext>
            </div>
        </div>
    );
}
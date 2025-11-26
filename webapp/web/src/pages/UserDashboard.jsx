import React, { useState } from 'react';
import client from '../api/axios';
import { useNavigate } from 'react-router-dom';

import { 
    FiLogOut, 
    FiPlus, 
    FiLayout, 
    FiSearch, 
    FiUser, 
    FiStar, 
    FiClock,
    FiGrid
} from 'react-icons/fi';

export default function UserDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [boards] = useState([
        { id: 1, title: 'Proyecto Web', lastEdit: 'Hace 2 horas', color: '#ff7eb3' },
        { id: 2, title: 'Marketing Q4', lastEdit: 'Ayer', color: '#82c91e' },
        { id: 3, title: 'Ideas App', lastEdit: 'Hace 5 días', color: '#ffd43b' },
    ]);

    const handleLogout = async () => {
        try {
            await client.post('/logout'); 
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        } finally {
            localStorage.removeItem('authToken'); 
            localStorage.removeItem('user'); 
            navigate('/');
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="glass-navbar">
                <div className="nav-logo" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div style={{background: 'var(--color-celestial)', padding: '5px', borderRadius: '8px', color: 'white', display:'flex'}}>
                         <FiLayout size={24} />
                    </div>
                    BufaloBoards
                </div>

                <div className="glass-search">
                    <FiSearch size={18} style={{opacity: 0.6}} />
                    <input type="text" placeholder="Buscar tableros..." />
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                     <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div style={{
                            width: '35px', height: '35px', borderRadius: '50%', 
                            background: 'var(--color-light-blue)', color: 'var(--color-prussian)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FiUser />
                        </div>
                        <span style={{fontSize: '0.9rem', fontWeight: 600}}>
                            {user ? user.name.split(' ')[0] : 'Usuario'}
                        </span>
                     </div>
                    
                    <button onClick={handleLogout} className="logout-btn" title="Cerrar Sesión">
                        <FiLogOut size={18} />
                    </button>
                </div>
            </nav>
            <main className="dashboard-content">
                
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon-bg"><FiGrid /></div>
                        <div>
                            <h3 style={{margin:0, fontSize: '1.5rem'}}>12</h3>
                            <small style={{opacity: 0.7}}>Tableros Activos</small>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-bg" style={{background: '#fff3bf', color: '#f08c00'}}><FiStar /></div>
                        <div>
                            <h3 style={{margin:0, fontSize: '1.5rem'}}>3</h3>
                            <small style={{opacity: 0.7}}>Favoritos</small>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-bg" style={{background: '#dbe4ff', color: '#4263eb'}}><FiClock /></div>
                        <div>
                            <h3 style={{margin:0, fontSize: '1.5rem'}}>5</h3>
                            <small style={{opacity: 0.7}}>Recientes</small>
                        </div>
                    </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h2 style={{color: 'var(--color-prussian)', fontSize: '1.4rem', display:'flex', alignItems:'center', gap:'10px'}}>
                        <FiLayout /> Mis Tableros
                    </h2>
                    <select className="glass-select" style={{width: '150px', margin: 0}}>
                        <option>Más recientes</option>
                        <option>Alfabético</option>
                    </select>
                </div>
                
                <div className="dashboard-grid">
                    
                    <div className="board-card new-board-card">
                        <FiPlus size={40} />
                        <span style={{fontWeight: 600}}>Crear Tablero</span>
                    </div>

                    {boards.map(board => (
                        <div key={board.id} className="board-card">
                            <div>
                                <div style={{
                                    width: '40px', height: '6px', 
                                    background: board.color, borderRadius: '4px', marginBottom: '15px'
                                }}></div>
                                <h3 style={{fontSize: '1.1rem', color: 'var(--color-prussian)', margin: 0}}>
                                    {board.title}
                                </h3>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                                <small style={{color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <FiClock size={12} /> {board.lastEdit}
                                </small>
                                <FiStar className="star-icon" style={{cursor: 'pointer', color: '#ccc'}} />
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
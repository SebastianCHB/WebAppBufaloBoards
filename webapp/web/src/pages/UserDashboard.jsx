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

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h2 style={{color: 'var(--color-prussian)', fontSize: '1.4rem', display:'flex', alignItems:'center', gap:'10px'}}>
                     Mis Tableros
                    </h2>
                </div>
                
                <div className="dashboard-grid">
                    
                    <div className="board-card new-board-card">
                        <FiPlus size={40} />
                        <span style={{fontWeight: 600}}>Crear Tablero</span>
                    </div>
                </div>

            </main>
        </div>
    );
}
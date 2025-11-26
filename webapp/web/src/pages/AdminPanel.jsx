import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const navigate = useNavigate();
    
    const [users] = useState([
        { id: 1, name: 'Admin Supremo', email: 'admin@bufalo.com', role: 'admin' },
        { id: 2, name: 'Juan Pérez', email: 'juan@test.com', role: 'user' },
        { id: 3, name: 'Maria Dev', email: 'maria@code.com', role: 'user' },
    ]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            
            <nav className="glass-navbar">
                <div className="nav-logo">Bufalo Boards</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                    <span>Bienvenido, <b>Jefe</b></span>
                    <button onClick={handleLogout} className="logout-btn">
                        Salir
                    </button>
                </div>
            </nav>

            <main className="dashboard-content">
                <h1 style={{ marginBottom: '20px', color: 'var(--color-prussian)' }}>
                    Gestión de Usuarios
                </h1>

                <div className="crud-layout">
                    
                    <div className="crud-form-section">
                        <div style={{ 
                            background: 'rgba(255,255,255,0.4)', 
                            padding: '25px', 
                            borderRadius: '20px',
                            border: '1px solid white'
                        }}>
                            <h3 style={{marginBottom: '15px', color: 'var(--color-lapis)'}}>
                                ✨ Nuevo Usuario
                            </h3>
                            
                            <form>
                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600'}}>Nombre</label>
                                    <input type="text" placeholder="Ej. Juan Pérez" className="glass-input" style={{background: 'rgba(255,255,255,0.6)', color: '#333'}} />
                                </div>

                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600'}}>Email</label>
                                    <input type="email" placeholder="usuario@email.com" className="glass-input" style={{background: 'rgba(255,255,255,0.6)', color: '#333'}} />
                                </div>

                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600'}}>Rol</label>
                                    <select className="glass-select" style={{background: 'rgba(255,255,255,0.6)'}}>
                                        <option value="user">Usuario Normal</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div style={{marginBottom: '20px'}}>
                                    <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600'}}>Contraseña</label>
                                    <input type="password" placeholder="******" className="glass-input" style={{background: 'rgba(255,255,255,0.6)', color: '#333'}} />
                                </div>

                                <button type="button" className="yummy-button" style={{fontSize: '1rem'}}>
                                    Guardar Usuario
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="crud-table-section">
                        <div style={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            padding: '20px', 
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}>
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Rol</th>
                                        <th style={{textAlign: 'center'}}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td>#{u.id}</td>
                                            <td>
                                                <div style={{fontWeight: 'bold'}}>{u.name}</div>
                                                <div style={{fontSize: '0.85rem', opacity: 0.7}}>{u.email}</div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px', 
                                                    borderRadius: '15px', 
                                                    background: u.role === 'admin' ? 'var(--color-lapis)' : 'var(--color-light-blue)',
                                                    color: u.role === 'admin' ? 'white' : 'var(--color-prussian)',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <button className="action-btn btn-edit">✏️</button>
                                                <button className="action-btn btn-delete">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
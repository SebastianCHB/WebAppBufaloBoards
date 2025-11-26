import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiLogOut, FiUsers, FiGrid, FiSettings, FiSearch, 
    FiBell, FiMenu, FiEdit2, FiTrash2, FiSave, FiMoreHorizontal 
} from 'react-icons/fi';

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
        <div className="app-container">
            
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-text">BufaloAdmin</div>
                </div>

                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active">
                        <FiGrid /> Dashboard
                    </a>
                    <a href="#" className="nav-item">
                        <FiUsers /> Usuarios
                    </a>
                    <a href="#" className="nav-item">
                        <FiSettings /> Configuración
                    </a>
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
                        <FiMenu className="menu-icon" />
                        <div className="search-box">
                            <FiSearch />
                            <input type="text" placeholder="Buscar..." />
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="icon-btn"><FiBell /></div>
                        <div className="user-profile">
                            <div className="avatar">JS</div>
                            <div className="user-info">
                                <span className="name">Jefe Supremo</span>
                                <span className="role">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="content-area">

                    <div className="main-grid">
                        
                        <div className="panel-card form-panel">
                            <div className="panel-header">
                                <h3>Nuevo Usuario</h3>
                            </div>
                            <form>
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input type="text" className="input-dark" placeholder="Nombre completo" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" className="input-dark" placeholder="correo@ejemplo.com" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Rol</label>
                                        <select className="input-dark">
                                            <option>User</option>
                                            <option>Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Pass</label>
                                        <input type="password" className="input-dark" placeholder="***" />
                                    </div>
                                </div>
                                <button type="button" className="btn-primary">
                                    <FiSave /> Guardar
                                </button>
                            </form>
                        </div>

                        <div className="panel-card table-panel">
                            <div className="panel-header">
                                <h3>Lista de Usuarios</h3>
                                <FiMoreHorizontal style={{cursor: 'pointer'}}/>
                            </div>
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Rol</th>
                                        <th style={{textAlign: 'right'}}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td>#{u.id}</td>
                                            <td>
                                                <div className="fw-bold">{u.name}</div>
                                                <div className="text-muted">{u.email}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.role}`}>{u.role}</span>
                                            </td>
                                            <td style={{textAlign: 'right'}}>
                                                <button className="action-icon"><FiEdit2 /></button>
                                                <button className="action-icon delete"><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <footer className="footer">
                        <p>&copy; 2025 BufaloBoards. Todos los derechos reservados.</p>
                    </footer>

                </main>
            </div>
        </div>
    );
}
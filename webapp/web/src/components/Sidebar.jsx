import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'; 
import client from '../api/axios'; 
import { FiEdit2, FiTrash2, FiSave, FiMoreHorizontal, FiRefreshCw, FiX } from 'react-icons/fi';

export default function AdminPanel() {
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(false); 
    
    const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
    const [isEditing, setIsEditing] = useState(false); 
    const [editId, setEditId] = useState(null); 

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await client.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Error cargando:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await client.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            alert("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.name || !form.email) return alert("Nombre y Email son obligatorios");
        if (!isEditing && !form.password) return alert("La contraseña es obligatoria para nuevos usuarios");

        try {
            if (isEditing) {
                await client.put(`/users/${editId}`, form);
                alert("Usuario actualizado correctamente");
            } else {
                await client.post('/users', form);
                alert("Usuario creado correctamente");
            }
            
            resetForm();
            fetchUsers();

        } catch (error) {
            console.error("Error al guardar:", error);
            if (error.response && error.response.status === 422) {
                alert("Error de validación: " + JSON.stringify(error.response.data.errors));
            } else {
                alert("Ocurrió un error al guardar.");
            }
        }
    };
    const handleEdit = (user) => {
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '' 
        });
        setIsEditing(true);
        setEditId(user.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

        try {
            await client.delete(`/users/${id}`);
            fetchUsers(); 
        } catch (error) {
            console.error(error);
            alert("No se pudo eliminar el usuario");
        }
    };

    const resetForm = () => {
        setForm({ name: '', email: '', role: 'user', password: '' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <AdminLayout>
            
            <div className="stats-row">
                <div className="card-stat">
                    <h3>{users.length}</h3>
                    <p>Usuarios Totales</p>
                </div>
                <div className="card-stat">
                    <h3>{users.filter(u => u.role === 'admin').length}</h3>
                    <p>Administradores</p>
                </div>
                <div className="card-stat">
                    <h3 style={{color: '#10b981'}}>Activo</h3> 
                    <p>Estado del Sistema</p>
                </div>
            </div>

            <div className="main-grid">
                
                <div className="panel-card form-panel">
                    <div className="panel-header">
                        <h3>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        {isEditing && (
                            <button onClick={resetForm} style={{background:'none', border:'none', color:'#ff6b6b', cursor:'pointer'}} title="Cancelar Edición">
                                <FiX size={20}/>
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input 
                                type="text" name="name" 
                                value={form.name} onChange={handleChange} 
                                className="input-dark" placeholder="Ej. Juan Pérez" 
                            />
                        </div>

                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input 
                                type="email" name="email" 
                                value={form.email} onChange={handleChange} 
                                className="input-dark" placeholder="usuario@email.com" 
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{flex:1}}>
                                <label>Rol</label>
                                <select 
                                    name="role" 
                                    value={form.role} onChange={handleChange} 
                                    className="glass-select"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label>Pass {isEditing && <small>(Opcional)</small>}</label>
                                <input 
                                    type="password" name="password" 
                                    value={form.password} onChange={handleChange} 
                                    className="input-dark" placeholder="***" 
                                />
                            </div>
                        </div>

                        <button type="submit" className="yummy-button">
                            <FiSave /> {isEditing ? 'Actualizar' : 'Guardar Usuario'}
                        </button>
                    </form>
                </div>

                <div className="panel-card table-panel">
                    <div className="panel-header">
                        <h3>Directorio ({users.length})</h3>
                        <button onClick={fetchUsers} className="action-icon" title="Recargar Lista">
                            <FiRefreshCw className={loading ? 'spin' : ''} />
                        </button>
                    </div>

                    <div style={{overflowX: 'auto'}}>
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
                                        <td style={{opacity: 0.6}}>#{u.id}</td>
                                        <td>
                                            <div className="fw-bold">{u.name}</div>
                                            <div className="text-muted" style={{fontSize: '0.8rem'}}>{u.email}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.role}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{textAlign: 'right'}}>
                                            <button onClick={() => handleEdit(u)} className="action-icon">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="action-icon delete">
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="4" style={{textAlign:'center', padding:'20px', opacity: 0.5}}>
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
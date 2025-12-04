import React, { useState } from 'react';
import client from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function Register() {
    const navigate = useNavigate();
    
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await client.post('/register', form);
            setShowSuccessModal(true);
            
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                const errorMsg = Object.values(err.response.data.errors).flat().join(', ');
                setError(errorMsg);
            } else {
                setError("Ocurrió un error al registrarse.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{position: 'relative'}}>
            
            {loading && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'4px', background:'rgba(255,255,255,0.1)', zIndex:9999}}>
                    <div style={{height:'100%', background:'var(--color-celestial)', width:'100%', animation:'indeterminate 1.5s infinite linear', transformOrigin: '0% 50%'}}></div>
                </div>
            )}

            <div className="glass-card" style={{maxWidth: '450px', animation: 'slideIn 0.5s ease-out'}}>
                <div className="logo-placeholder">
                    <h1>Crear Cuenta</h1>
                    <p style={{fontSize: '0.9rem', color: 'var(--color-light-blue)', marginTop: '5px'}}>Únete a BufaloBoards</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{position: 'relative'}}>
                        <div style={{position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-80%)', display: 'flex', color: 'var(--color-light-blue)', pointerEvents: 'none'}}>
                            <FiUser size={20} />
                        </div>
                        <input 
                            type="text" 
                            name="name"
                            placeholder="Nombre Completo"
                            className="glass-input"
                            style={{paddingLeft: '50px'}}
                            value={form.name}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group" style={{position: 'relative'}}>
                        <div style={{position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-80%)', display: 'flex', color: 'var(--color-light-blue)', pointerEvents: 'none'}}>
                            <FiMail size={20} />
                        </div>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Correo Electrónico"
                            className="glass-input"
                            style={{paddingLeft: '50px'}}
                            value={form.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group" style={{position: 'relative'}}>
                        <div style={{position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-80%)', display: 'flex', color: 'var(--color-light-blue)', pointerEvents: 'none'}}>
                            <FiLock size={20} />
                        </div>
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Contraseña"
                            className="glass-input"
                            style={{paddingLeft: '50px'}}
                            value={form.password}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group" style={{position: 'relative'}}>
                        <div style={{position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-80%)', display: 'flex', color: 'var(--color-light-blue)', pointerEvents: 'none'}}>
                            <FiLock size={20} />
                        </div>
                        <input 
                            type="password" 
                            name="password_confirmation"
                            placeholder="Confirmar Contraseña"
                            className="glass-input"
                            style={{paddingLeft: '50px'}}
                            value={form.password_confirmation}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    
                    {error && (
                        <div style={{
                            marginBottom: '20px', padding: '10px', borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <FiAlertCircle size={20} style={{flexShrink: 0}}/>
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="yummy-button" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                
                <div style={{marginTop: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px'}}>
                    <span style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem'}}>¿Ya tienes cuenta? </span>
                    <Link to="/" className="auth-link" style={{display: 'inline', marginLeft: '5px'}}>
                        Inicia Sesión
                    </Link>
                </div>
            </div>

            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-card" style={{maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.3)', animation: 'slideIn 0.3s'}}>
                        <div style={{marginBottom: '20px', color: '#34d399'}}>
                            <FiCheckCircle size={60} />
                        </div>
                        <h2 style={{marginBottom: '10px', color: 'white'}}>¡Registro Exitoso!</h2>
                        <p style={{opacity: 0.8, marginBottom: '20px'}}>Redirigiendo al login...</p>
                        
                        <div style={{width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden'}}>
                            <div style={{width: '100%', height: '100%', background: '#34d399', animation: 'indeterminate 2s linear'}}></div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes indeterminate {
                    0% { transform:  translateX(-100%); }
                    100% { transform:  translateX(100%); }
                }
            `}</style>
        </div>
    );
}
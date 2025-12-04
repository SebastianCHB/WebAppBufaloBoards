import React, { useState } from 'react';
import client from '../api/axios';
import { Link } from 'react-router-dom';
import { 
    FiUser, FiLock, FiLogIn, FiLayout, FiEye, FiEyeOff, FiAlertTriangle 
} from 'react-icons/fi';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            localStorage.clear();

            const response = await client.post('/login', { email, password });
            const { access_token, user } = response.data;

            if (access_token && user) {
                localStorage.setItem('authToken', access_token);
                localStorage.setItem('user', JSON.stringify(user));

                if (user.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                setError("Respuesta incorrecta del servidor.");
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("Correo o contraseña incorrectos.");
            } else {
                setError("Error de conexión. Intenta más tarde.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{position: 'relative', overflow: 'hidden'}}>
            
            {loading && (
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
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>

            <div className="glass-card" style={{maxWidth: '420px', padding: '40px 30px', animation: 'slideIn 0.5s ease-out'}}>
                
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <div style={{
                        display: 'inline-flex', padding: '15px', borderRadius: '50%', 
                        background: 'linear-gradient(135deg, var(--color-celestial), var(--color-lapis))',
                        boxShadow: '0 10px 25px rgba(27, 152, 224, 0.5)',
                        marginBottom: '15px', animation: 'float 3s ease-in-out infinite'
                    }}>
                        <FiLayout size={32} color="white" />
                    </div>
                    <h1 style={{fontSize: '2rem', fontWeight: '700', color: 'white', letterSpacing: '1px'}}>BufaloBoards</h1>
                    <p style={{color: 'var(--color-light-blue)', fontSize: '0.9rem'}}>Gestiona tus proyectos con estilo</p>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group" style={{position: 'relative', marginBottom: '20px'}}>
                        <div style={{position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-80%)', display: 'flex', color: 'var(--color-light-blue)', pointerEvents: 'none'}}>
                            <FiUser size={20} />
                        </div>
                        <input 
                            type="email" 
                            placeholder="Correo Electrónico"
                            className="glass-input"
                            style={{paddingLeft: '50px'}}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{position: 'relative', marginBottom: '25px'}}>
                        <div style={{position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-80%)', display: 'flex', color: 'var(--color-light-blue)', pointerEvents: 'none'}}>
                            <FiLock size={20} />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            className="glass-input"
                            style={{paddingLeft: '50px', paddingRight: '45px'}}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            disabled={loading}
                        />
                        <div 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{position: 'absolute', top: '55%', right: '15px', transform: 'translateY(-80%)', color: 'var(--color-light-blue)', cursor: 'pointer', opacity: 0.7}}
                        >
                            {showPassword ? <FiEyeOff size={20}/> : <FiEye size={20}/>}
                        </div>
                    </div>
                    
                    {error && (
                        <div style={{
                            marginBottom: '20px', padding: '12px', borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px',
                            animation: 'slideIn 0.2s'
                        }}>
                            <FiAlertTriangle size={18} style={{flexShrink: 0}}/>
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="yummy-button" disabled={loading} style={{fontSize: '1rem', padding: '14px'}}>
                        {loading ? 'Ingresando...' : (
                            <>Ingresar <FiLogIn /></>
                        )}
                    </button>
                </form>
                
                <div style={{marginTop: '30px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px'}}>
                    <span style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem'}}>¿No tienes una cuenta? </span>
                    <Link to="/register" className="auth-link" style={{display: 'inline', marginLeft: '5px', fontWeight: '600', color: 'var(--color-celestial)'}}>
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    );
}
import { useState } from 'react';
import client from '../api/axios';
// import { useNavigate } from 'react-router-dom'; // YA NO LO NECESITAMOS AQUÍ
import { Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    // const navigate = useNavigate(); // BORRAR ESTO

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Limpieza preventiva
            localStorage.clear();

            const response = await client.post('/login', { email, password });
            console.log(response.data); // Para ver si llega el token
            
            const { access_token, user } = response.data;

            if (access_token && user) {
                // 1. Guardar datos
                localStorage.setItem('authToken', access_token);
                localStorage.setItem('user', JSON.stringify(user));

                // 2. LA SOLUCIÓN NUCLEAR: Forzar recarga del navegador
                // Esto obliga al ProtectedRoute a leer el token fresco sí o sí.
                if (user.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                setError("Respuesta incompleta del servidor.");
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            setError('Credenciales incorrectas o error de servidor');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card">
                <h1>BufaloBoards</h1>
                <p style={{textAlign:'center', color: '#888', marginBottom:'20px'}}>Acceso al Sistema</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="glass-input"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                    <br /> {/* Espacio extra */}
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        className="glass-input"
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                    
                    {error && <div style={{marginTop: '15px', color: '#ff6b6b', textAlign:'center', fontWeight:'bold'}}>{error}</div>}
                    
                    <button type="submit" disabled={loading} className="yummy-button" style={{marginTop:'20px'}}>
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
                
                <div style={{marginTop: '20px', textAlign: 'center'}}>
                    <Link to="/register" className="auth-link">Registrarse</Link>
                </div>
            </div>
        </div>
    );
}
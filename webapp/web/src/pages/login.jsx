
import { useState } from 'react';
import client from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';    

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await client.post('/login', {
                email: email,
                password: password
            });
            console.log("Datos recibidos:", response.data);

            const token = response.data.access_token;
            const user = response.data.user;

            if (token && user) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));

                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError("Login incompleto: No llegó el usuario o el token.");
            }

        } catch (err) {
            console.error(err);
            setError("Error al iniciar sesión.");
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card">
                
                <div className="logo-placeholder">
                    <h1> BufaloBoards</h1>
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: '25px', fontWeight: '300' }}>
                    Bienvenido de nuevo
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <input 
                            type="email" 
                            placeholder="Tu correo electrónico"
                            className="glass-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <input 
                            type="password" 
                            placeholder="Tu contraseña"
                            className="glass-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    {error && <p className="error-msg" style={{textAlign: 'center', marginBottom: '15px'}}>{error}</p>}

                    <button type="submit" className="yummy-button">
                        Ingresar
                    </button>
                </form>
                
                <Link to="/register" className="auth-link">
                    ¿No tienes cuenta? Regístrate aquí
                </Link>
            </div>
        </div>
    );
}
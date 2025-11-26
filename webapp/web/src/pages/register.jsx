import { useState } from 'react';
import client from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({}); // Parauardaerrores de validación
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); 

        try {
            await client.post('/register', {
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            });

            alert('¡Registro exitoso! Ahora inicia sesión.');
            navigate('/');

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data); 
            } else {
                console.error(error);
                alert("Ocurrió un error en el servidor.");
            }
        }
    };

   return (
        <div className="auth-container">
            <div className="glass-card">
                 <div className="logo-placeholder">
                    <h1>BufaloBoards</h1>
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '300' }}>Crear Cuenta</h2>
                
                <form onSubmit={handleSubmit}>
                    <div>
                        <input 
                            type="text" placeholder="Nombre Completo" className="glass-input"
                            value={name} onChange={(e) => setName(e.target.value)} required 
                        />
                        {errors.name && <small className="error-msg">{errors.name[0]}</small>}
                    </div>

                    <div>
                        <input 
                            type="email" placeholder="Correo Electrónico" className="glass-input"
                            value={email} onChange={(e) => setEmail(e.target.value)} required 
                        />
                        {errors.email && <small className="error-msg">{errors.email[0]}</small>}
                    </div>

                    <div>
                        <input 
                            type="password" placeholder="Contraseña" className="glass-input"
                            value={password} onChange={(e) => setPassword(e.target.value)} required 
                        />
                        {errors.password && <small className="error-msg">{errors.password[0]}</small>}
                    </div>

                    <div>
                        <input 
                            type="password" placeholder="Confirmar Contraseña" className="glass-input"
                            value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required 
                        />
                    </div>

                    <button type="submit" className="yummy-button">
                        Registrarse
                    </button>
                </form>

                <Link to="/" className="auth-link">
                    ¿Ya tienes cuenta? Inicia Sesión aquí
                </Link>
            </div>
        </div>
    );
}
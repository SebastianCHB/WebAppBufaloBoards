import axios from 'axios';

const client = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// INTERCEPTOR: Inyectar token en cada petición automáticamente
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
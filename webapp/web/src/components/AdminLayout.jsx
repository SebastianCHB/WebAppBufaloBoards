import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export default function AdminLayout({ children }) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Usuario' };

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                <main className="content-area">
                    {children}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
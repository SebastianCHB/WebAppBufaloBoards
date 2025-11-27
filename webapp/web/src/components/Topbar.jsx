import React from 'react';
import { FiMenu, FiSearch, FiBell } from 'react-icons/fi';

export default function Topbar({ user }) {
    return (
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
                    <div className="avatar">
                        {user ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="user-info">
                        <span className="name">{user ? user.name : 'Usuario'}</span>
                        <span className="role">{user ? user.role : 'Admin'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
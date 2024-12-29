// src/components/layout/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
import axios from '@/services/api';
const Sidebar = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            localStorage.removeItem('profile');
            localStorage.removeItem('auth');
            window.location.href = '/login';
            await axios.post('/auth/logout');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="h-screen w-16 bg-card border-r flex flex-col items-center py-4">
            <nav className="flex-1 flex flex-col items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3 rounded-lg hover:bg-secondary text-foreground"
                >
                    <LayoutDashboard className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-lg hover:bg-secondary text-foreground">
                    <Bell className="h-5 w-5" />
                </button>
                <button
                    onClick={() => navigate('/messages')}
                    className="p-3 rounded-lg hover:bg-secondary text-foreground"
                >
                    <MessageSquare className="h-5 w-5" />
                </button>
            </nav>

            <button
                onClick={handleLogout}
                className="p-3 rounded-lg hover:bg-destructive hover:text-destructive-foreground mt-auto"
            >
                <LogOut className="h-5 w-5" />
            </button>
        </div>
    );
};

export default Sidebar;

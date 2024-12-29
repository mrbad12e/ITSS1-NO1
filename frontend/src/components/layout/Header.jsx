// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Search, Settings, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ProfileImage from '../common/ProfileImage';
const Header = () => {
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const profile = localStorage.getItem('profile');
        if (profile) {
            setUser(JSON.parse(profile));
        }
    }, []);

    return (
        <Card className="flex items-center justify-between px-4 py-2 w-full">
            <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-secondary">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-secondary">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (searchTerm.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
                    }
                }}
                className="flex-1 max-w-xl mx-4"
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users, forums, or messages..."
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary"
                    />
                </div>
            </form>

            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-secondary">
                    <Settings className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden">
                    {user?.profile_image ? (
                        <ProfileImage src={user.profile_image} alt={user.name} size='md'/>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Header;

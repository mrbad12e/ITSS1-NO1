// src/components/layout/Layout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
};

export default Layout;


'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    email: string;
    data: Record<string, any>; // Flexible to support both old and new formats
    lastUpdated: string; // ISO date string
    history?: { date: string; count: number }[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (data: Record<string, any>, lastUpdated: Date, history?: { date: string; count: number }[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Load from local storage on mount
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (token: string, user: User) => {
        setToken(token);
        setUser(user);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    const updateUser = (data: Record<string, any>, lastUpdated: Date, history?: { date: string; count: number }[]) => {
        if (user) {
            const updatedUser = {
                ...user,
                data,
                lastUpdated: lastUpdated.toISOString(),
                ...(history && { history })
            };
            setUser(updatedUser);
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

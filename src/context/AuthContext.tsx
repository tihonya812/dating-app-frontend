/*import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {Profile, User, getCurrentUser, getProfileById, getProfileByUserId} from "../api/api";
import { Spin } from "antd";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    role: string | null;
    setRole: (role: string) => void;
    login: (user: User, token: string, role: string, profileId?: number) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async (userData: User) => {
        try {
            if (userData.profileId) {
                const response = await getProfileById(userData.profileId);
                const profile = response.data;
                setUser((prev) => (prev ? { ...prev, profile, profileId: userData.profileId } : null));
            } else if (userData.id) {
                // Если profileId отсутствует, пытаемся найти профиль по userId
                const profileResponse = await getProfileByUserId(userData.id);
                const profile = profileResponse.data;
                if (profile.id) {
                    setUser((prev) => (prev ? { ...prev, profile, profileId: profile.id } : null));
                }
            }
        } catch (err) {
            console.error("Failed to load user profile:", err);
            // Если профиль не найден, оставляем user без профиля
        }
    };

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("token");
            const storedRole = localStorage.getItem("role");

            if (token && storedRole) {
                try {
                    const response = await getCurrentUser({ headers: { Authorization: `Bearer ${token}` } });
                    let userData = response.data;
                    setRole(storedRole);
                    setUser(userData); // Сначала устанавливаем базового user
                    await loadUserProfile(userData); // Затем загружаем профиль
                } catch (err) {
                    console.error("Failed to restore session:", err);
                    logout(); // Разлогиниваем при ошибке
                }
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = (userData: User, token: string, role: string, profileId?: number) => {
        console.log("Logging in with profileId:", profileId);
        localStorage.setItem("token", token);
        setUser({ ...userData, profileId: profileId || userData.profile?.id });
        setRole(role);
        localStorage.setItem("role", role);
    };

    const logout = () => {
        console.log("Logging out user:", user);
        setUser(null);
        setRole(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    };

    return (
        <AuthContext.Provider value={{ user, setUser, role, setRole, login, logout, loading }}>
            {loading ? <Spin size="large" style={{ display: "block", margin: "50px auto" }} /> : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}*/
/*import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Profile, User, getProfileById, getCurrentUser, LoginResponse } from "../api/api"; // Импортируем getCurrentUser

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    role: string | null;
    setRole: (role: string) => void;
    login: (user: User, token: string, role: string, profileId?: number) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Функция для загрузки профиля
    const loadUserProfile = async (userData: User) => {
        try {
            if (userData.profileId) {
                const response = await getProfileById(userData.profileId);
                const profile = response.data;
                setUser((prevUser) => (prevUser ? { ...prevUser, profile } : null));
            }
        } catch (err) {
            console.error("Failed to load user profile:", err);
        }
    };

    // Восстановление сессии при загрузке страницы
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("token");
            const storedRole = localStorage.getItem("role");

            if (token && storedRole) {
                try {
                    // Получаем текущего пользователя через /me
                    const response = await getCurrentUser({ headers: { Authorization: `Bearer ${token}` } });
                    const userData = response.data;
                    setRole(storedRole);
                    setUser(userData); // Устанавливаем пользователя
                    await loadUserProfile(userData); // Загружаем профиль
                } catch (err) {
                    console.error("Failed to restore session:", err);
                    logout(); // Разлогиниваем, если токен недействителен
                }
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = async (userData: User, token: string, role: string, profileId?: number) => {
        console.log("Logging in with profileId:", profileId);
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        const updatedUser = { ...userData, profileId: profileId || userData.profile?.id };
        setRole(role);
        setLoading(true);
        setUser(updatedUser); // Устанавливаем пользователя
        await loadUserProfile(updatedUser); // Загружаем профиль
        setLoading(false);
    };

    const logout = () => {
        console.log("Logging out user:", user);
        setUser(null);
        setRole(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    };

    return (
        <AuthContext.Provider value={{ user, setUser, role, setRole, login, logout, loading }}>
            {loading ? <div>Загрузка...</div> : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}*/
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Profile, User, getCurrentUser, getProfileById, getProfileByUserId } from "../api/api";
import { Spin } from "antd";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    role: string | null;
    setRole: (role: string) => void;
    login: (user: User, token: string, role: string, profileId?: number) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async (userData: User) => {
        try {
            if (userData.profileId) {
                const response = await getProfileById(userData.profileId);
                const profile = response.data;
                setUser((prev) => (prev ? { ...prev, profile, profileId: userData.profileId } : null));
            } else if (userData.id) {
                const profileResponse = await getProfileByUserId(userData.id);
                const profile = profileResponse.data;
                if (profile.id) {
                    setUser((prev) => (prev ? { ...prev, profile, profileId: profile.id } : null));
                }
            }
        } catch (err) {
            console.log("Profile not found for user, proceeding without profile:", userData.id);
            // Не выводим ошибку в консоль, просто продолжаем без профиля
        }
    };

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("token");
            const storedRole = localStorage.getItem("role");

            console.log("Restoring session - Token:", token, "Role:", storedRole);

            if (token && storedRole) {
                try {
                    const response = await getCurrentUser({ headers: { Authorization: `Bearer ${token}` } });
                    let userData = response.data;
                    console.log("getCurrentUser response:", userData);
                    if (userData && userData.id) {
                        setRole(storedRole);
                        setUser(userData);
                        await loadUserProfile(userData);
                    } else {
                        console.error("No user data returned from getCurrentUser");
                        logout();
                    }
                } catch (err) {
                    console.error("Failed to restore session:", err);
                    logout();
                }
            } else {
                console.log("No token or role in localStorage, user will be null");
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = (userData: User, token: string, role: string, profileId?: number) => {
        console.log("Logging in with profileId:", profileId, "User:", userData);
        localStorage.setItem("token", token);
        setUser({ ...userData, profileId: profileId || userData.profile?.id });
        setRole(role);
        localStorage.setItem("role", role);
        setLoading(false);
    };

    const logout = () => {
        console.log("Logging out user:", user);
        setUser(null);
        setRole(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, role, setRole, login, logout, loading }}>
            {loading ? <Spin size="large" style={{ display: "block", margin: "50px auto" }} /> : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
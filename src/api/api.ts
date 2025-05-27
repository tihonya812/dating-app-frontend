import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import { getToken } from "../utils/auth";

const instance = axios.create({
    baseURL: "http://localhost:8080",
});

instance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Типы данных
export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    profile?: Profile;
    profileId?: number; // Добавь это
}

export interface Profile {
    id?: number;
    name?: string;
    age?: number;
    city?: string;
    bio?: string;
    userId?: number | null;
    photos?: Photo[];
    preferences?: Preference[];
    interests?: Interest[] | null;
}

export interface Photo {
    id: number;
    url: string;
}

export interface Preference {
    id: number;
    category: string;
    value: string;
}

export interface Interest {
    id: number;
    name: string;
}

export interface LoginResponse {
    token: string;
    role: string;
    user: {
        id: number;
        username: string;
        email: string;
        password: string; // Может быть null
        role: string;
        profile?: {
            id?: number;
            name?: string;
            age?: number;
            city?: string;
            bio?: string;
            userId?: number | null;
            photos?: Photo[];
            preferences?: Preference[];
            interests?: Interest[] | null; // interests может быть null
        };
        profileId?: number; // Добавь это
    };
}

// Добавить в интерфейсы
export interface Message {
    id?: number;
    senderId: number;
    receiverId: number;
    text: string;
    timestamp: string;
}

// API методы
export const getUsers = (): Promise<AxiosResponse<User[]>> => instance.get("/users");
export const getProfiles = (): Promise<AxiosResponse<Profile[]>> => instance.get("/profiles");
export const createProfile = (data: Profile): Promise<AxiosResponse<Profile>> =>
    instance.post("/profiles", data);
export const updateProfile = (id: number, data: Profile): Promise<AxiosResponse<Profile>> =>
    instance.put(`/profiles/${id}`, data);
export const deleteProfile = (id: number): Promise<AxiosResponse<void>> =>
    instance.delete(`/profiles/${id}`);
export const register = (data: { username: string; email: string; password: string; role: string }): Promise<AxiosResponse<User>> =>
    instance.post("/api/auth/register", data);
export const login = (data: { email: string; password: string }): Promise<AxiosResponse<LoginResponse>> =>
    instance.post("/api/auth/login", data);
export const getCurrentUser = (config?: AxiosRequestConfig): Promise<AxiosResponse<User>> =>
    instance.get("/api/auth/me", config);
export const getInterests = (): Promise<AxiosResponse<Interest[]>> =>
    instance.get("/interests");
export const addInterestToProfile = (profileId: number, interestId: number): Promise<AxiosResponse<Profile>> =>
    instance.post(`/profiles/${profileId}/interests/${interestId}`);
export const getAllUsers = (): Promise<AxiosResponse<User[]>> =>
    instance.get("/admin/users");
export const getAllProfiles = (): Promise<AxiosResponse<Profile[]>> =>
    instance.get("/admin/profiles");
export const deleteUser = (id: number): Promise<AxiosResponse<void>> =>
    instance.delete(`/admin/users/${id}`);
export const deleteProfileByAdmin = (id: number): Promise<AxiosResponse<void>> =>
    instance.delete(`/admin/profiles/${id}`);
export const likeProfile = (likerId: number, likedId: number): Promise<AxiosResponse<void>> =>
    instance.post(`/profiles/${likerId}/like/${likedId}`);
export const getMatches = (profileId: number, minAge: number, maxAge: number): Promise<AxiosResponse<Profile[]>> =>
    instance.get(`/profiles/${profileId}/matches`, { params: { minAge, maxAge } });
export const deletePhoto = (photoId: number): Promise<AxiosResponse<void>> =>
    instance.delete(`/photos/${photoId}`);
export const getMessages = (userId: number): Promise<AxiosResponse<Message[]>> =>
    instance.get(`/messages/${userId}`);
export const sendMessage = (data: { senderId: string; receiverId: string; text: string }): Promise<AxiosResponse<Message>> =>
    instance.post("/messages", data);
export const getProfileByUserId = (userId: number, config?: AxiosRequestConfig): Promise<AxiosResponse<Profile>> =>
    instance.get(`/profiles/user/${userId}`, config);
export const getProfileById = (id: number, config?: AxiosRequestConfig): Promise<AxiosResponse<Profile>> =>
    instance.get(`/profiles/${id}`, config);

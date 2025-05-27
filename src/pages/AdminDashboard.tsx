import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllProfiles, deleteUser, deleteProfileByAdmin } from "../api/api";
import { Table, Button, message } from "antd";
import { User, Profile } from "../api/api";
import { getToken, getRole } from "../utils/auth";

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (getRole() !== "ADMIN") {
            message.error("Доступ запрещён!");
            navigate("/");
            return;
        }

        setLoading(true);
        Promise.all([
            getAllUsers().then(res => setUsers(res.data)),
            getAllProfiles().then(res => setProfiles(res.data)),
        ])
            .catch(err => {
                console.error("Error fetching data:", err);
                message.error("Ошибка загрузки данных.");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleDeleteUser = async (userId: number) => {
        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(user => user.id !== userId));
            message.success("Пользователь удалён!");
        } catch (error) {
            message.error("Ошибка при удалении пользователя.");
            console.error("Delete user error:", error);
        }
    };

    const handleDeleteProfile = async (profileId: number) => {
        try {
            await deleteProfileByAdmin(profileId);
            setProfiles(prev => prev.filter(profile => profile.id !== profileId));
            message.success("Профиль удалён!");
        } catch (error) {
            message.error("Ошибка при удалении профиля.");
            console.error("Delete profile error:", error);
        }
    };

    const userColumns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Имя", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Роль", dataIndex: "role", key: "role" },
        {
            title: "Действия",
            key: "actions",
            render: (_: any, record: User) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => handleDeleteUser(record.id!)} // Убеждаемся, что id существует
                    disabled={record.id === undefined}
                >
                    Удалить
                </Button>
            ),
        },
    ];

    const profileColumns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Имя", dataIndex: "name", key: "name" },
        { title: "Возраст", dataIndex: "age", key: "age" },
        { title: "Город", dataIndex: "city", key: "city" },
        {
            title: "Действия",
            key: "actions",
            render: (_: any, record: Profile) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => handleDeleteProfile(record.id!)} // Убеждаемся, что id существует
                    disabled={record.id === undefined}
                >
                    Удалить
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1>Админ-панель</h1>
            <h2>Пользователи</h2>
            <Table
                dataSource={users}
                columns={userColumns}
                rowKey="id"
                loading={loading}
            />
            <h2>Профили</h2>
            <Table
                dataSource={profiles}
                columns={profileColumns}
                rowKey="id"
                loading={loading}
            />
        </div>
    );
};

export default AdminDashboard;
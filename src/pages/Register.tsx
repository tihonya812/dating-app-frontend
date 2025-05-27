import { useState } from "react";
import { Card, Button, Input, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import { register } from "../api/api";
import axios from "axios";

const { Option } = Select;

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("USER");

    const handleRegister = async () => {
        try {
            const response = await register({ username, email, password, role });
            message.success("Регистрация успешна! Пожалуйста, войдите в систему.");
            navigate("/login");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message === "Этот email уже занят.") {
                message.error("Этот email уже занят. Используйте другой email.");
            } else {
                message.error("Ошибка регистрации. Проверьте данные.");
            }
            console.error("Register error:", error);
        }
    };

    return (
        <Card title="Регистрация" style={{ maxWidth: 400, margin: "auto", marginTop: "5rem" }}>
            <Input
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginBottom: 10 }}
            />
            <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: 10 }}
            />
            <Input.Password
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginBottom: 10 }}
            />
            <Select value={role} onChange={setRole} style={{ marginBottom: 10 }} placeholder="Роль">
                <Option value="USER">Пользователь</Option>
                <Option value="ADMIN">Администратор</Option>
            </Select>
            <Button type="primary" onClick={handleRegister} block>
                Зарегистрироваться
            </Button>
        </Card>
    );
}

export default Register;
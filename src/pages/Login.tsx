import { useState } from "react";
import { Card, Button, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login, getProfileByUserId, Profile } from "../api/api";
import { saveToken } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { setRole, setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");



    const handleLogin = async () => {
        try {
            const response = await login({ email, password });
            console.log("Login response:", response.data);
            saveToken(response.data.token, response.data.role);
            setRole(response.data.role);

            const currentUser = {
                ...response.data.user,
                profile: undefined,
                profileId: undefined,
            };
            setUser(currentUser);

            try {
                const profileResponse = await getProfileByUserId(currentUser.id);
                setUser({
                    ...currentUser,
                    profile: profileResponse.data,
                    profileId: profileResponse.data.id, // Сохраняем profileId
                });
            } catch (err) {
                console.log("Профиль не найден, можно создать новый");
            }

            message.success("Вход успешен!");
            navigate("/");
        } catch (error) {
            message.error("Ошибка входа. Проверьте email или пароль.");
            console.error("Login error:", error);
        }
    };

    /*const handleLogin = async () => {
        try {
            const response = await login({ email, password });
            saveToken(response.data.token, response.data.role);
            setRole(response.data.role);


            // Убедитесь, что response.data.user содержит корректный id (число)
            console.log("Данные пользователя после входа:", response.data.user);
            setUser(response.data.user);

            // Устанавливаем пользователя с актуальными данными
            const currentUser = {
                ...response.data.user,
                profile: undefined, // Пока не загружен профиль
            };
            setUser(currentUser);

            // Пытаемся загрузить профиль
            try {
                const profileResponse = await getProfileById(currentUser.id);
                setUser({
                    ...currentUser,
                    profile: profileResponse.data,
                });
            } catch (err) {
                console.log("Профиль не найден, можно создать новый");
            }

            message.success("Вход успешен!");
            navigate("/");
        } catch (error) {
            message.error("Ошибка входа. Проверьте email или пароль.");
            console.error("Login error:", error);
        }
    };*/

    /*const handleLogin = async () => {
        try {
            const response = await login({ email, password });
            console.log("Login response:", response.data); // Логируем ответ
            saveToken(response.data.token, response.data.role);
            setRole(response.data.role);

            // Загружаем профиль отдельно
            let profile: Profile | undefined = undefined;
            try {
                const profileResponse = await getProfileById(response.data.user.id);
                profile = profileResponse.data;
                console.log("Profile loaded:", profile);
            } catch (err) {
                console.log("Профиль не найден:", err);
            }

            // Устанавливаем user с профилем
            setUser({ ...response.data.user, profile });

            message.success("Вход успешен!");
            navigate("/");
        } catch (error) {
            message.error("Ошибка входа. Проверьте email или пароль.");
            console.error("Login error:", error);
        }
    };*/

    return (
        <Card title="Вход" style={{ maxWidth: 400, margin: "auto", marginTop: "5rem" }}>
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
            <Button type="primary" onClick={handleLogin} block>
                Войти
            </Button>
        </Card>
    );
}

export default Login;
/*
import { useNavigate } from "react-router-dom";
import {Button, Card, message} from "antd";
import { useAuth } from "../context/AuthContext";
import {getProfileByUserId} from "../api/api";

function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProfileClick = async () => {
        if (user) {
            try {
                const profileResponse = await getProfileByUserId(user.id);
                if (profileResponse.data.id) {
                    navigate(`/profile/${profileResponse.data.id}`);
                } else {
                    throw new Error("Профиль не найден");
                }
            } catch (err) {
                message.warning("У вас нет профиля. Создайте его!");
                navigate("/profile/new");
            }
        }
    };
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <Card title="Добро пожаловать в Dating App!" style={{ maxWidth: 400, textAlign: "center" }}>
                <p>Найдите свою любовь или новых друзей!</p>
                {user ? (
                    <>
                        <p>Добро пожаловать, {user.username}!</p>
                        <Button type="primary" onClick={() => navigate("/feed")} style={{ marginRight: "1rem" }}>
                            Перейти к ленте
                        </Button>
                        <Button onClick={handleProfileClick}>
                            Мой профиль
                        </Button>
                    </>
                ) : (
                    <>
                        <Button type="primary" onClick={() => navigate("/login")} style={{ marginRight: "1rem" }}>
                            Вход
                        </Button>
                        <Button onClick={() => navigate("/register")}>Регистрация</Button>
                    </>
                )}
            </Card>
        </div>
    );
}

export default Home;*/
import { useNavigate } from "react-router-dom";
import { Button, Card, message } from "antd";
import { useAuth } from "../context/AuthContext";
import { getProfileByUserId } from "../api/api";

function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProfileClick = async () => {
        if (user) {
            try {
                const profileResponse = await getProfileByUserId(user.id);
                if (profileResponse.data.id) {
                    navigate(`/profile/${profileResponse.data.id}`);
                } else {
                    throw new Error("Профиль не найден");
                }
            } catch (err) {
                message.warning("У вас нет профиля. Создайте его!");
                navigate("/profile/new");
            }
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <Card title="Добро пожаловать в Dating App!" style={{ maxWidth: 400, textAlign: "center" }}>
                <p>Найдите свою любовь или новых друзей!</p>
                {user ? (
                    <>
                        <p>Добро пожаловать, {user.username}!</p>
                        {/* Новый абзац */}
                        <p style={{ margin: "1rem 0", color: "#555" }}>
                            Присоединяйтесь к нашей ленте, чтобы найти интересных людей, или обновите свой профиль, чтобы рассказать о себе больше!
                        </p>
                        <Button type="primary" onClick={() => navigate("/feed")} style={{ marginRight: "1rem" }}>
                            Перейти к ленте
                        </Button>
                        <Button onClick={handleProfileClick}>
                            Мой профиль
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Новый абзац */}
                        <p style={{ margin: "1rem 0", color: "#555" }}>
                            Зарегистрируйтесь или войдите, чтобы начать знакомиться с новыми людьми уже сегодня!
                        </p>
                        <Button type="primary" onClick={() => navigate("/login")} style={{ marginRight: "1rem" }}>
                            Вход
                        </Button>
                        <Button onClick={() => navigate("/register")}>Регистрация</Button>
                    </>
                )}
            </Card>
        </div>
    );
}

export default Home;

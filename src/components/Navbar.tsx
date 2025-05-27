/*
/!*
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Menu } from "antd";
import { getProfileByUserId} from "../api/api";
import { message } from "antd";

const { Header } = Layout;

const Navbar = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();

    /!*const handleProfileClick = async () => {
        if (user) {
            try {
                await getProfileByUserId(user.id);
                navigate(`/profile/${user.id}`);
            } catch (err) {
                message.warning("У вас нет профиля. Создайте его!");
                navigate("/profile/new");
            }
        }
    };*!/

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

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems = [
        {
            key: "1",
            label: <Link to="/">Главная</Link>,
        },
        ...(user
            ? [
                {
                    key: "2",
                    label: <Link to="/feed">Лента</Link>,
                },
                {
                    key: "3",
                    label: "Мой профиль",
                    onClick: handleProfileClick,
                },
                {
                    key: "4",
                    label: <Link to="/messages">Сообщения</Link>,
                },
                ...(role === "ADMIN"
                    ? [
                        {
                            key: "5",
                            label: <Link to="/admin/dashboard">Админ-панель</Link>,
                        },
                    ]
                    : []),
                {
                    key: "6",
                    label: (
                        <Button type="primary" danger onClick={handleLogout}>
                            Выход
                        </Button>
                    ),
                },
            ]
            : [
                {
                    key: "7",
                    label: <Link to="/register">Регистрация</Link>,
                },
                {
                    key: "8",
                    label: <Link to="/login">Вход</Link>,
                },
            ]),
    ];

    return (
        <Header style={{ display: "flex", alignItems: "center" }}>
            <div style={{ color: "white", fontSize: 24, fontWeight: "bold", marginRight: "2rem" }}>
                Dating App
            </div>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]} items={menuItems} />
        </Header>
    );
};

export default Navbar;*!/
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button, Layout, Menu, Spin } from "antd";
import { getProfileByUserId } from "../api/api";
import { message } from "antd";

const { Header } = Layout;

const Navbar = () => {
    const { user, role, logout, loading: authLoading } = useAuth();
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

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (authLoading) {
        return <Spin size="small" style={{ marginLeft: "20px" }} />;
    }

    const menuItems = [
        {
            key: "1",
            label: <Link to="/">Главная</Link>,
        },
        ...(user
            ? [
                {
                    key: "2",
                    label: <Link to="/feed">Лента</Link>,
                },
                {
                    key: "3",
                    label: "Мой профиль",
                    onClick: handleProfileClick,
                },
                {
                    key: "4",
                    label: <Link to="/messages">Сообщения</Link>,
                },
                ...(role === "ADMIN"
                    ? [
                        {
                            key: "5",
                            label: <Link to="/admin/dashboard">Админ-панель</Link>,
                        },
                    ]
                    : []),
                {
                    key: "6",
                    label: (
                        <Button type="primary" danger onClick={handleLogout}>
                            Выход
                        </Button>
                    ),
                },
            ]
            : [
                {
                    key: "7",
                    label: <Link to="/register">Регистрация</Link>,
                },
                {
                    key: "8",
                    label: <Link to="/login">Вход</Link>,
                },
            ]),
    ];

    return (
        <Header style={{ display: "flex", alignItems: "center", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "#001529" }}>
            <div style={{ color: "white", fontSize: 24, fontWeight: "bold", marginRight: "2rem" }}>
                Dating App
            </div>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]} items={menuItems} style={{ flex: 1 }} />
        </Header>
    );
};

export default Navbar;
*/
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Spin } from "antd";
import { getProfileByUserId } from "../api/api";
import { message } from "antd";

const { Header } = Layout;

const Navbar = () => {
    const { user, role, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (authLoading) {
        return <Spin size="small" style={{ margin: "20px", display: "block" }} />;
    }

    const getSelectedKey = () => {
        switch (location.pathname) {
            case "/":
                return "1";
            case "/feed":
                return "2";
            case "/messages":
                return "4";
            case "/profile":
            case "/profile/new":
                return "3";
            case "/admin/dashboard":
                return "5";
            case "/about":
                return "6";
            case "/register":
                return "7";
            case "/login":
                return "8";
            default:
                return "1";
        }
    };

    const menuItems = [
        {
            key: "1",
            label: <Link to="/">Главная</Link>,
        },
        ...(user
            ? [
                {
                    key: "2",
                    label: <Link to="/feed">Лента</Link>,
                },
                {
                    key: "3",
                    label: <Link to="#" onClick={handleProfileClick}>Мой профиль</Link>,
                },
                {
                    key: "4",
                    label: <Link to="/messages">Сообщения</Link>,
                },
                ...(role === "ADMIN"
                    ? [
                        {
                            key: "5",
                            label: <Link to="/admin/dashboard">Админ-панель</Link>,
                        },
                    ]
                    : []),
                {
                    key: "6",
                    label: <Link to="/about">О нас</Link>,
                },
                {
                    key: "9",
                    label: <Link to="#" onClick={handleLogout}>Выход</Link>,
                },
            ]
            : [
                {
                    key: "7",
                    label: <Link to="/register">Регистрация</Link>,
                },
                {
                    key: "8",
                    label: <Link to="/login">Вход</Link>,
                },
            ]),
    ];

    return (
        <Header
            style={{
                background: "#001529",
                padding: "0 20px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
        >
            <div style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginRight: "2rem" }}>
                Dating App
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[getSelectedKey()]}
                items={menuItems}
                style={{ flex: 1, minWidth: 0, lineHeight: "64px" }}
            />
        </Header>
    );
};

export default Navbar;
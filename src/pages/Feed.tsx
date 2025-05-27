/*
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {getProfileByUserId, likeProfile, getMatches, getProfiles} from "../api/api";
import { Card, Button, Image, Spin, message, List, Typography } from "antd";
import { HeartFilled, RightOutlined } from "@ant-design/icons";
import { motion } from "framer-motion"; // Для анимаций
import { Profile } from "../api/api";
import { useAuth } from "../context/AuthContext";

const { Text, Title } = Typography;

const Feed: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matches, setMatches] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        if (!user) {
            message.error("Пожалуйста, войдите в систему!");
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const profileResponse = await getProfileByUserId(user.id, {
                    signal: abortController.signal,
                });
                if (!profileResponse.data.id) {
                    throw new Error("Профиль не найден");
                }

                const [profilesResponse, matchesResponse] = await Promise.all([
                    getProfiles(),
                    getMatches(profileResponse.data.id, 18, 99),
                ]);

                if (isMounted) {
                    const filteredProfiles = profilesResponse.data.filter(
                        (profile: Profile) => profile.id !== profileResponse.data.id
                    );
                    setProfiles(filteredProfiles);
                    setMatches(matchesResponse.data);
                }
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error("Error fetching data:", err);
                if (isMounted) {
                    message.warning("У вас нет профиля. Создайте его, чтобы начать просмотр ленты!");
                    navigate("/profile/new");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [user?.id, navigate]);

    const handleLike = async () => {
        if (!user?.profile?.id || !profiles[currentIndex]?.id) return;

        try {
            await likeProfile(user.profile.id!, profiles[currentIndex].id!);
            message.success(`Вы лайкнули ${profiles[currentIndex].name}!`);
            nextProfile();

            const updatedMatches = await getMatches(user.profile.id!, 18, 99);
            setMatches(updatedMatches.data);
        } catch (error) {
            message.error("Ошибка при лайке профиля.");
            console.error("Like error:", error);
        }
    };

    const nextProfile = () => {
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            message.info("Больше профилей нет!");
            setCurrentIndex(0);
        }
    };

    if (loading) return <Spin size="large" />;
    if (profiles.length === 0) return <div>Нет доступных профилей</div>;

    const currentProfile = profiles[currentIndex];

    return (
        <div style={{ padding: "1rem" }}>
            <Card
                style={{ width: 400, textAlign: "center", margin: "auto" }}
                cover={
                    currentProfile.photos && currentProfile.photos.length > 0 ? (
                        <Image
                            src={currentProfile.photos[0].url}
                            alt="Profile"
                            style={{ width: "100%", height: "300px", objectFit: "cover" }}
                        />
                    ) : (
                        <div style={{ height: "300px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            Нет фото
                        </div>
                    )
                }
            >
                <h2>{currentProfile.name}, {currentProfile.age}</h2>
                <p>{currentProfile.city}</p>
                <p>{currentProfile.bio || "Нет биографии"}</p>
                <div style={{ marginTop: "1rem" }}>
                    <Button type="primary" onClick={handleLike} style={{ marginRight: "1rem" }}>
                        Лайк
                    </Button>
                    <Button onClick={nextProfile}>Пропустить</Button>
                </div>
            </Card>
            {matches.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h2>Ваши совпадения</h2>
                    <List
                        dataSource={matches}
                        renderItem={(match) => (
                            <List.Item>
                                <Link to={`/messages?receiverId=${match.id}`}>{match.name}</Link>
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </div>
    );
};

/!*const Feed: React.FC = () => {
<Link to={`/profile/${match.id}`}>{match.name}</Link>
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matches, setMatches] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            message.error("Пожалуйста, войдите в систему!");
            navigate("/login");
            return;
        }

        console.log("User in Feed:", user); // Логируем user для отладки
        if (!user.profile?.id) {
            console.log("Нет профиля, перенаправляем на /profile/new");
            message.warning("У вас нет профиля. Создайте его, чтобы начать просмотр ленты!");
            navigate("/profile/new");
            return;
        }

        setLoading(true);
        Promise.all([
            getProfiles().then(res => {
                const filteredProfiles = res.data.filter((profile: Profile) => profile.id !== user.profile?.id);
                setProfiles(filteredProfiles);
            }),
            getMatches(user.profile.id, 18, 99).then(res => setMatches(res.data)),
        ])
            .catch(err => {
                console.error("Error fetching data:", err);
                message.error("Ошибка загрузки данных.");
            })
            .finally(() => setLoading(false));
    }, [user, navigate]);

    const handleLike = async () => {
        if (!user?.profile?.id || !profiles[currentIndex]?.id) return;

        try {
            await likeProfile(user.profile.id!, profiles[currentIndex].id!);
            message.success(`Вы лайкнули ${profiles[currentIndex].name}!`);
            nextProfile();

            const updatedMatches = await getMatches(user.profile.id!, 18, 99);
            setMatches(updatedMatches.data);
        } catch (error) {
            message.error("Ошибка при лайке профиля.");
            console.error("Like error:", error);
        }
    };

    const nextProfile = () => {
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            message.info("Больше профилей нет!");
            setCurrentIndex(0);
        }
    };

    if (loading) return <Spin size="large" />;
    if (profiles.length === 0) return <div>Нет доступных профилей</div>;

    const currentProfile = profiles[currentIndex];

    return (
        <div style={{ padding: "2rem", maxWidth: 600, margin: "auto" }}>
            {loading ? (
                <Spin size="large" />
            ) : profiles.length === 0 ? (
                <Text>Нет доступных профилей</Text>
            ) : (
                <motion.div
                    key={currentProfile.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card
                        style={{
                            width: "100%",
                            textAlign: "center",
                            borderRadius: 8,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        cover={
                            currentProfile.photos && currentProfile.photos.length > 0 ? (
                                <Image
                                    src={currentProfile.photos[0].url}
                                    alt="Profile"
                                    style={{
                                        width: "100%",
                                        height: 300,
                                        objectFit: "cover",
                                        borderTopLeftRadius: 8,
                                        borderTopRightRadius: 8,
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        height: 300,
                                        background: "#f0f0f0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderTopLeftRadius: 8,
                                        borderTopRightRadius: 8,
                                    }}
                                >
                                    <Text type="secondary">Нет фото</Text>
                                </div>
                            )
                        }
                    >
                        <Title level={3}>
                            {currentProfile.name}, {currentProfile.age}
                        </Title>
                        <Text>{currentProfile.city}</Text>
                        <p>
                            <Text type="secondary">
                                {currentProfile.bio || "Нет биографии"}
                            </Text>
                        </p>
                        <div style={{ marginTop: "1rem" }}>
                            <Button
                                type="primary"
                                icon={<HeartFilled />}
                                onClick={handleLike}
                                style={{ marginRight: "1rem", borderRadius: 4 }}
                            >
                                Лайк
                            </Button>
                            <Button
                                icon={<RightOutlined />}
                                onClick={nextProfile}
                                style={{ borderRadius: 4 }}
                            >
                                Пропустить
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}
            {matches.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <Title level={3}>Ваши совпадения</Title>
                    <List
                        dataSource={matches}
                        renderItem={(match) => (
                            <List.Item>
                                <Link to={`/profile/${match.id}`}>
                                    {match.name}
                                </Link>
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </div>
    );
};*!/

    /!*return (
        <div style={{ padding: "1rem" }}>
            <Card
                style={{ width: 400, textAlign: "center", margin: "auto" }}
                cover={
                    currentProfile.photos && currentProfile.photos.length > 0 ? (
                        <Image
                            src={currentProfile.photos[0].url}
                            alt="Profile"
                            style={{ width: "100%", height: "300px", objectFit: "cover" }}
                        />
                    ) : (
                        <div style={{ height: "300px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            Нет фото
                        </div>
                    )
                }
            >
                <h2>{currentProfile.name}, {currentProfile.age}</h2>
                <p>{currentProfile.city}</p>
                <p>{currentProfile.bio || "Нет биографии"}</p>
                <div style={{ marginTop: "1rem" }}>
                    <Button type="primary" onClick={handleLike} style={{ marginRight: "1rem" }}>
                        Лайк
                    </Button>
                    <Button onClick={nextProfile}>Пропустить</Button>
                </div>
            </Card>
            {matches.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h2>Ваши совпадения</h2>
                    <List
                        dataSource={matches}
                        renderItem={(match) => (
                            <List.Item>
                                <Link to={`/profile/${match.id}`}>{match.name}</Link>
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </div>
    );
};*!/

export default Feed;*/
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfileByUserId, likeProfile, getMatches, getProfiles, getProfileById } from "../api/api";
import {Card, Button, Image, Spin, message, Row, Col, Typography} from "antd";
import { HeartFilled, RightOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Profile } from "../api/api";
import { useAuth } from "../context/AuthContext";

const { Text, Title } = Typography;

const Feed: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matches, setMatches] = useState<{ id: number; userId: number; name: string; age?: number; city?: string; photos?: { id: number; url: string }[] }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        if (!user) {
            message.error("Пожалуйста, войдите в систему!");
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const profileResponse = await getProfileByUserId(user.id, {
                    signal: abortController.signal,
                });
                if (!profileResponse.data.id) {
                    throw new Error("Профиль не найден");
                }

                const [profilesResponse, matchesResponse] = await Promise.all([
                    getProfiles(),
                    getMatches(profileResponse.data.id, 18, 99),
                ]);

                if (isMounted) {
                    const filteredProfiles = profilesResponse.data.filter(
                        (profile: Profile) => profile.id !== profileResponse.data.id
                    );
                    setProfiles(filteredProfiles);

                    // Преобразуем matches, добавляя userId
                    const updatedMatches = await Promise.all(
                        matchesResponse.data.map(async (match: Profile) => {
                            const profile = await getProfileById(match.id!); // Получаем полный профиль для userId
                            return {
                                id: match.id!,
                                userId: profile.data.userId!, // Берем userId из профиля
                                name: match.name!,
                                age: match.age,
                                city: match.city,
                                photos: match.photos,
                            };
                        })
                    );
                    setMatches(updatedMatches);
                }
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error("Error fetching data:", err);
                if (isMounted) {
                    message.warning("У вас нет профиля. Создайте его, чтобы начать просмотр ленты!");
                    navigate("/profile/new");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [user?.id, navigate]);

    const handleLike = async () => {
        if (!user?.profile?.id || !profiles[currentIndex]?.id) return;

        try {
            await likeProfile(user.profile.id!, profiles[currentIndex].id!);
            message.success(`Вы лайкнули ${profiles[currentIndex].name}!`);
            nextProfile();

            const updatedMatches = await getMatches(user.profile.id!, 18, 99);
            const newMatches = await Promise.all(
                updatedMatches.data.map(async (match: Profile) => {
                    const profile = await getProfileById(match.id!);
                    return {
                        id: match.id!,
                        userId: profile.data.userId!,
                        name: match.name!,
                        age: match.age,
                        city: match.city,
                        photos: match.photos,
                    };
                })
            );
            setMatches(newMatches);
        } catch (error) {
            message.error("Ошибка при лайке профиля.");
            console.error("Like error:", error);
        }
    };

    const nextProfile = () => {
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            message.info("Больше профилей нет!");
            setCurrentIndex(0);
        }
    };

    if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
    if (profiles.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Title level={2}>Пока нет доступных профилей</Title>
                    <Text>Попробуйте вернуться позже!</Text>
                </motion.div>
            </div>
        );
    }

    const currentProfile = profiles[currentIndex];

    return (
        <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    style={{ width: "100%", textAlign: "center", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    cover={
                        currentProfile.photos && currentProfile.photos.length > 0 ? (
                            <Image
                                src={currentProfile.photos[0].url}
                                alt="Profile"
                                style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "10px 10px 0 0" }}
                            />
                        ) : (
                            <div style={{ height: "400px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px 10px 0 0" }}>
                                <Text type="secondary">Нет фото</Text>
                            </div>
                        )
                    }
                >
                    <Title level={3}>{currentProfile.name}, {currentProfile.age}</Title>
                    <Text type="secondary" style={{ display: "block", marginBottom: "1rem" }}>{currentProfile.city}</Text>
                    <Text style={{ display: "block" }}>{currentProfile.bio || "Нет биографии"}</Text>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
                        <Button
                            type="primary"
                            icon={<HeartFilled />}
                            onClick={handleLike}
                            style={{ background: "#ff4d4f", borderColor: "#ff4d4f" }}
                        >
                            Лайк
                        </Button>
                        <Button icon={<RightOutlined />} onClick={nextProfile}>
                            Пропустить
                        </Button>
                    </div>
                </Card>
            </motion.div>

            {matches.length > 0 && (
                <div style={{ marginTop: "3rem" }}>
                    <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>Ваши совпадения</Title>
                    <Row gutter={[16, 16]} style={{ marginTop: "1rem" }}>
                        {matches.map((match) => (
                            <Col xs={24} sm={12} md={8} key={match.id}>
                                <Card
                                    hoverable
                                    style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                                    cover={
                                        match.photos && match.photos.length > 0 ? (
                                            <Image
                                                src={match.photos[0].url}
                                                alt={match.name}
                                                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px 10px 0 0" }}
                                            />
                                        ) : (
                                            <div style={{ height: "200px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px 10px 0 0" }}>
                                                <Text type="secondary">Нет фото</Text>
                                            </div>
                                        )
                                    }
                                >
                                    <Card.Meta
                                        title={<Link to={`/messages?receiverId=${match.userId}`} style={{ color: "#1890ff" }}>{match.name}</Link>}
                                        description={<Text type="secondary">{match.age} лет, {match.city}</Text>}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </div>
    );
};

export default Feed;
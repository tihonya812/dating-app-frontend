/*
import { useEffect, useState } from "react";
import { Card, List, Spin, message } from "antd";
import { useAuth } from "../context/AuthContext";
import { getMatches } from "../api/api";
import { Link } from "react-router-dom";
import { Profile } from "../api/api";

const Matches = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.profile?.id && !user?.id) {
            message.error("Пожалуйста, войдите и создайте профиль!");
            return;
        }

        const fetchMatches = async () => {
            setLoading(true);
            try {
                const res = await getMatches(user.profile?.id || user.id, 18, 99);
                setMatches(res.data);
            } catch (err) {
                console.error("Error fetching matches:", err);
                message.error("Ошибка загрузки совпадений.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [user?.id]);

    if (loading) return <Spin size="large" />;
    if (matches.length === 0) return <p>У вас пока нет совпадений</p>;

    return (
        <Card title="Ваши совпадения" style={{ maxWidth: 600, margin: "auto" }}>
            <List
                dataSource={matches}
                renderItem={(match) => (
                    <List.Item>
                        <Link to={`/messages?receiverId=${match.id}`}>{match.name}</Link>
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default Matches;*/
import { useEffect, useState } from "react";
import { Card, Spin, message, Row, Col, Typography, Button, Image } from "antd";
import { useAuth } from "../context/AuthContext";
import { getMatches, getProfileById } from "../api/api";
import { Link } from "react-router-dom";
import { Profile } from "../api/api";
import { motion } from "framer-motion";

const { Text, Title } = Typography;

const Matches = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<{ id: number; userId: number; name: string; age?: number; city?: string; photos?: { id: number; url: string }[] }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.profile?.id && !user?.id) {
            message.error("Пожалуйста, войдите и создайте профиль!");
            return;
        }

        const fetchMatches = async () => {
            setLoading(true);
            try {
                const res = await getMatches(user.profile?.id || user.id, 18, 99);
                const updatedMatches = await Promise.all(
                    res.data.map(async (match: Profile) => {
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
                setMatches(updatedMatches);
            } catch (err) {
                console.error("Error fetching matches:", err);
                message.error("Ошибка загрузки совпадений.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [user?.id]);

    if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
    if (matches.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Title level={2}>Пока нет совпадений</Title>
                    <Text>Начните лайкать профили, чтобы найти совпадения!</Text>
                    <Button type="primary" style={{ marginTop: "1rem" }} onClick={() => window.location.href = "/feed"}>
                        Перейти в ленту
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
            <Title level={2} style={{ textAlign: "center", color: "#1890ff", marginBottom: "2rem" }}>Ваши совпадения</Title>
            <Row gutter={[16, 16]}>
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
    );
};

export default Matches;

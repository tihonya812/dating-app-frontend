import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProfileById } from "../api/api";
import { Card, Spin, List, Image, Button, message, Typography } from "antd";
import { UserOutlined, HomeOutlined, InfoCircleOutlined, CameraOutlined, HeartOutlined } from "@ant-design/icons";import { Profile, Photo, Interest } from "../api/api";
import { useAuth } from "../context/AuthContext";

const { Text, Title } = Typography;

function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        const fetchProfile = async () => {
            try {
                const targetProfileId = id ? Number(id) : user?.profileId;
                if (!targetProfileId) {
                    if (isMounted) {
                        message.error("Пользователь не найден");
                        setLoading(false);
                    }
                    return;
                }
                const profileResponse = await getProfileById(targetProfileId, {
                    signal: abortController.signal,
                });
                if (isMounted) {
                    setProfile(profileResponse.data);
                    setLoading(false);
                }
            } catch (err: any) {
                if (err.name === "AbortError") {
                console.error("Error fetching profile:", err);
            }
                if (isMounted) {
                    setLoading(false);
                    if (user && (!id || Number(id) === user.profileId)) {
                        message.warning("У вас нет профиля. Создайте его!");
                        navigate("/profile/new");
                    } else {
                        message.error("Профиль не найден");
                    }
                }
            }
        };

        if (user?.id) fetchProfile();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [id, navigate, user?.id, user?.profileId]);

    if (loading) return <Spin size="large" />;
    if (!profile) return <div>Профиль не найден</div>;

    const isOwnProfile = user && user.profileId &&  Number(id) === user.profileId;

    return (
        <Card
            title={<Title level={3}>{profile.name || "Без имени"}</Title>}
            style={{
                maxWidth: 600,
                margin: "2rem auto",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            <p>
                <UserOutlined /> <strong>Возраст:</strong>{" "}
                <Text>{profile.age || "Не указан"}</Text>
            </p>
            <p>
                <HomeOutlined /> <strong>Город:</strong>{" "}
                <Text>{profile.city || "Не указан"}</Text>
            </p>
            <p>
                <InfoCircleOutlined /> <strong>Биография:</strong>{" "}
                <Text>{profile.bio || "Не указана"}</Text>
            </p>

            <Title level={4}>
                <CameraOutlined /> Фотографии
            </Title>
            {profile.photos && profile.photos.length > 0 ? (
                <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={profile.photos}
                    renderItem={(photo: Photo) => (
                        <List.Item>
                            <Image
                                src={photo.url}
                                alt="Profile photo"
                                width={100}
                                style={{ borderRadius: 4 }}
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Text type="secondary">Фотографий нет</Text>
            )}

            <Title level={4}>
                <HeartOutlined /> Интересы
            </Title>
            {profile.interests && profile.interests.length > 0 ? (
                <List
                    dataSource={profile.interests}
                    renderItem={(interest: Interest) => (
                        <List.Item>
                            <Text>{interest.name}</Text>
                        </List.Item>
                    )}
                />
            ) : (
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Интересов нет
                </Text>
            )}

            {isOwnProfile && (
                <Button
                    type="primary"
                    icon={<UserOutlined />}
                    style={{ borderRadius: 4 }}
                >
                    <Link to={`/profile/edit/${profile.id}`}>Редактировать</Link>
                </Button>
            )}
        </Card>
    );
}

export default ProfilePage;
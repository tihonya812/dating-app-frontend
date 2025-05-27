/*
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getProfileByUserId,
    createProfile,
    updateProfile,
    deleteProfile,
    getInterests,
    addInterestToProfile,
    deletePhoto, getProfileById,
} from "../api/api";
import {Card, Button, Input, Form, message, Spin, Upload, Select, Typography} from "antd";
import { UploadOutlined, UserOutlined, HomeOutlined, InfoCircleOutlined, HeartOutlined } from "@ant-design/icons";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import { Profile, Interest, Photo } from "../api/api";
import axios from "axios";
import { getToken } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
const { Title } = Typography;
const { Option } = Select;

function EditProfile() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { user, setUser } = useAuth(); // Добавляем setUser
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [interests, setInterests] = useState<Interest[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
    const [profileId, setProfileId] = useState<number | null>(null); // Убрали зависимость от user.profileId
    const isNewProfile = !id && !user?.profileId;

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const interestsResponse = await getInterests();
                if (isMounted) {
                    setInterests(interestsResponse.data);
                }

                if (user?.id) {
                    setLoading(true);
                    try {
                        let profileResponse;
                        if (id) {
                            console.log("Fetching profile by ID:", id);
                            profileResponse = await getProfileById(Number(id));
                        } else {
                            console.log("Fetching profile for userId:", user.id);
                            profileResponse = await getProfileByUserId(user.id);
                        }
                        const profile = profileResponse.data;
                        console.log("Profile fetched:", profile);
                        if (isMounted) {
                            form.setFieldsValue(profile);
                            setFileList(
                                profile.photos?.map((photo: Photo) => ({
                                    uid: photo.id!.toString(),
                                    name: photo.url.split("/").pop() || "photo.jpg",
                                    status: "done",
                                    url: photo.url,
                                })) || []
                            );
                            setSelectedInterests(profile.interests?.map((i: Interest) => i.id!) || []);
                            setProfileId(profile.id ?? null);
                            console.log("ProfileId set to:", profile.id);
                        }
                    } catch (error) {
                        console.log("No profile found for userId:", user.id);
                        // Если профиль не найден, считаем, что это новый профиль
                        if (isMounted) {
                            setProfileId(null);
                        }
                    } finally {
                        if (isMounted) {
                            setLoading(false);
                        }
                    }
                }
            } catch (error) {
                if (isMounted) {
                    message.error("Ошибка загрузки данных профиля.");
                    console.error("Error fetching profile:", error);
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [user?.id, id, form]);

    const onFinish = async (values: any) => {
        try {
            if (!user || !user.id) {
                message.error("Пользователь не авторизован. Пожалуйста, войдите снова.");
                return;
            }

            const profileData: Profile = {
                name: values.name,
                age: Number(values.age),
                city: values.city,
                bio: values.bio,
                userId: user.id,
                photos: fileList.map((f) => ({ id: Number(f.uid), url: f.url! })),
            };

            let newProfileId: number | null = profileId;

            if (isNewProfile) {
                const response = await createProfile(profileData);
                if (response.data.id === undefined) {
                    throw new Error("Не удалось создать профиль: ID отсутствует.");
                }
                newProfileId = response.data.id;
                setProfileId(newProfileId);

                setUser({
                    ...user,
                    profile: response.data,
                    profileId: newProfileId,
                });
            } else if (profileId) {
                console.log("Updating profile with ID:", profileId, "Data:", profileData);
                const response = await updateProfile(profileId, profileData);
                setUser({
                    ...user,
                    profile: { ...profileData, id: profileId },
                    profileId,
                });
            } else {
                message.error("Профиль не сохранён. Ошибка идентификатора.");
                return;
            }

            if (newProfileId) {
                for (const interestId of selectedInterests) {
                    await addInterestToProfile(newProfileId, interestId);
                }
            }

            message.success(isNewProfile ? "Профиль создан!" : "Профиль обновлён!");
            navigate(`/profile/${newProfileId}`);
        } catch (error) {
            message.error("Ошибка при сохранении профиля.");
            console.error("Save error:", error);
        }
    };

    const handleDelete = async () => {
        if (profileId) {
            try {
                await deleteProfile(profileId);
                message.success("Профиль удалён!");

                // Сбрасываем profileId и обновляем user
                setProfileId(null);
                setUser({ ...user!, profile: undefined, profileId: undefined });
                navigate("/profile/new");
            } catch (error) {
                message.error("Ошибка при удалении профиля.");
                console.error("Delete error:", error);
            }
        }
    };

    const handleUpload = async ({ file, onSuccess, onError }: any) => {
        if (!profileId) {
            message.error("Сначала сохраните профиль, чтобы загрузить фото.");
            onError?.(new Error("Profile not saved"));
            return;
        }

        const formData = new FormData();
        formData.append("file", file as RcFile);
        try {
            const response = await axios.post(`http://localhost:8080/photos/${profileId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            const { id, url } = response.data;
            setFileList(prev => [
                ...prev,
                { uid: id.toString(), name: file.name, status: "done", url },
            ]);
            message.success("Фото загружено!");
            onSuccess?.(response.data);
        } catch (error) {
            message.error("Ошибка загрузки фото.");
            console.error("Upload error:", error);
            onError?.(error);
        }
    };

    const handleRemovePhoto = async (file: UploadFile) => {
        if (!file.uid || isNaN(Number(file.uid))) {
            message.error("Некорректный идентификатор фото.");
            return;
        }
        try {
            await deletePhoto(Number(file.uid));
            setFileList(prev => prev.filter(item => item.uid !== file.uid));
            message.success("Фото удалено!");
        } catch (error) {
            message.error("Ошибка при удалении фото.");
            console.error("Remove photo error:", error);
        }
    };

    const handleUploadChange = (info: UploadChangeParam) => {
        setFileList(info.fileList);
    };


    return (
        <Card
            title={<Title level={3}>{isNewProfile ? "Создать профиль" : "Редактировать профиль"}</Title>}
            style={{
                maxWidth: 600,
                margin: "2rem auto",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            {loading ? (
                <Spin size="large" />
            ) : (
                <Form form={form} onFinish={onFinish} layout="vertical" style={{ padding: "1rem" }}>
                    <Form.Item
                        label="Имя"
                        name="name"
                        rules={[{ required: true, message: "Пожалуйста, введите имя!" }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Введите имя"
                            style={{ borderRadius: 4 }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Возраст"
                        name="age"
                        rules={[{ required: true, message: "Пожалуйста, введите возраст!" }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            type="number"
                            placeholder="Введите возраст"
                            style={{ borderRadius: 4 }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Город"
                        name="city"
                        rules={[{ required: true, message: "Пожалуйста, введите город!" }]}
                    >
                        <Input
                            prefix={<HomeOutlined />}
                            placeholder="Введите город"
                            style={{ borderRadius: 4 }}
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span>
                                <InfoCircleOutlined style={{ marginRight: 8 }} /> Биография
                            </span>
                        }
                        name="bio"
                    >
                        <Input.TextArea
                            placeholder="Расскажите о себе"
                            style={{ borderRadius: 4, minHeight: 100 }}
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span>
                                <HeartOutlined style={{ marginRight: 8 }} /> Интересы
                            </span>
                        }
                    >
                        <Select
                            mode="multiple"
                            value={selectedInterests}
                            onChange={setSelectedInterests}
                            placeholder="Выберите интересы"
                            style={{ borderRadius: 4, width: "100%" }}
                        >
                            {interests.map((interest) => (
                                <Option key={interest.id} value={interest.id}>
                                    {interest.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Фото">
                        <Upload
                            fileList={fileList}
                            customRequest={handleUpload}
                            onChange={handleUploadChange}
                            onRemove={handleRemovePhoto}
                            listType="picture-card"
                        >
                            <Button icon={<UploadOutlined />} style={{ borderRadius: 4 }}>
                                Загрузить фото
                            </Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ borderRadius: 4, marginRight: 10 }}
                        >
                            Сохранить
                        </Button>
                        {!isNewProfile && profileId && (
                            <Button
                                type="primary"
                                danger
                                onClick={handleDelete}
                                style={{ borderRadius: 4 }}
                            >
                                Удалить
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
}

export default EditProfile;*/
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getProfileByUserId,
    createProfile,
    updateProfile,
    deleteProfile,
    getInterests,
    addInterestToProfile,
    deletePhoto,
    getProfileById,
} from "../api/api";
import { Card, Button, Input, Form, message, Spin, Upload, Select, Typography } from "antd";
import { UploadOutlined, UserOutlined, HomeOutlined, InfoCircleOutlined, HeartOutlined } from "@ant-design/icons";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import { Profile, Interest, Photo } from "../api/api";
import axios from "axios";
import { getToken } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
const { Title } = Typography;
const { Option } = Select;

function EditProfile() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [interests, setInterests] = useState<Interest[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
    const [profileId, setProfileId] = useState<number | null>(null);
    const isNewProfile = !id && !user?.profileId;

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const interestsResponse = await getInterests();
                if (isMounted) setInterests(interestsResponse.data);

                if (user?.id) {
                    setLoading(true);
                    try {
                        let profileResponse;
                        if (id) {
                            profileResponse = await getProfileById(Number(id));
                        } else {
                            profileResponse = await getProfileByUserId(user.id);
                        }
                        const profile = profileResponse.data;
                        if (isMounted) {
                            form.setFieldsValue(profile);
                            setFileList(
                                profile.photos?.map((photo: Photo) => ({
                                    uid: photo.id!.toString(),
                                    name: photo.url.split("/").pop() || "photo.jpg",
                                    status: "done",
                                    url: photo.url,
                                })) || []
                            );
                            setSelectedInterests(profile.interests?.map((i: Interest) => i.id!) || []);
                            setProfileId(profile.id ?? null);
                            if (profile.id && !user.profileId) {
                                setUser({ ...user, profileId: profile.id, profile });
                            }
                        }
                    } catch (error) {
                        console.log("No profile found for userId:", user.id);
                        if (isMounted) setProfileId(null);
                    } finally {
                        if (isMounted) setLoading(false);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    message.error("Ошибка загрузки данных профиля.");
                    console.error("Error fetching profile:", error);
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [user?.id, id, form, setUser]);

    const onFinish = async (values: any) => {
        try {
            if (!user || !user.id) {
                message.error("Пользователь не авторизован.");
                return;
            }

            const profileData: Profile = {
                name: values.name,
                age: Number(values.age),
                city: values.city,
                bio: values.bio,
                userId: user.id,
                photos: fileList.map((f) => ({ id: Number(f.uid), url: f.url! })),
            };

            let newProfileId: number | undefined;

            if (isNewProfile) {
                const response = await createProfile(profileData);
                newProfileId = response.data.id; // id может быть undefined, если сервер не вернул его
                if (newProfileId === undefined) {
                    throw new Error("Не удалось создать профиль: ID отсутствует.");
                }
                setProfileId(newProfileId);
                setUser({ ...user, profile: response.data, profileId: newProfileId });
            } else if (profileId) {
                await updateProfile(profileId, profileData);
                setUser({ ...user, profile: { ...profileData, id: profileId }, profileId });
            } else {
                message.error("Профиль не сохранён. Ошибка идентификатора.");
                return;
            }

            if (newProfileId !== undefined || profileId) {
                const finalProfileId = newProfileId || profileId!;
                for (const interestId of selectedInterests) {
                    await addInterestToProfile(finalProfileId, interestId);
                }
            }

            message.success(isNewProfile ? "Профиль создан!" : "Профиль обновлён!");
            navigate(`/profile/${newProfileId || profileId}`);
        } catch (error) {
            message.error("Ошибка при сохранении профиля.");
            console.error("Save error:", error);
        }
    };

    const handleDelete = async () => {
        if (profileId) {
            try {
                await deleteProfile(profileId);
                message.success("Профиль удалён!");
                setProfileId(null);
                setUser({ ...user!, profile: undefined, profileId: undefined });
                navigate("/profile/new");
            } catch (error) {
                message.error("Ошибка при удалении профиля.");
                console.error("Delete error:", error);
            }
        }
    };

    const handleUpload = async ({ file, onSuccess, onError }: any) => {
        if (!profileId) {
            message.error("Сначала сохраните профиль.");
            onError?.(new Error("Profile not saved"));
            return;
        }
        const formData = new FormData();
        formData.append("file", file as RcFile);
        try {
            const response = await axios.post(`http://localhost:8080/photos/${profileId}`, formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${getToken()}` },
            });
            const { id, url } = response.data;
            setFileList((prev) => [
                ...prev,
                { uid: id.toString(), name: file.name, status: "done", url },
            ]);
            message.success("Фото загружено!");
            onSuccess?.(response.data);
        } catch (error) {
            message.error("Ошибка загрузки фото.");
            console.error("Upload error:", error);
            onError?.(error);
        }
    };

    const handleRemovePhoto = async (file: UploadFile) => {
        if (!file.uid || isNaN(Number(file.uid))) {
            message.error("Некорректный идентификатор фото.");
            return;
        }
        try {
            await deletePhoto(Number(file.uid));
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
            message.success("Фото удалено!");
        } catch (error) {
            message.error("Ошибка при удалении фото.");
            console.error("Remove photo error:", error);
        }
    };

    const handleUploadChange = (info: UploadChangeParam) => {
        setFileList(info.fileList);
    };

    return (
        <Card
            title={<Title level={3}>{isNewProfile ? "Создать профиль" : "Редактировать профиль"}</Title>}
            style={{ maxWidth: 600, margin: "2rem auto", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
            {loading ? (
                <Spin size="large" />
            ) : (
                <Form form={form} onFinish={onFinish} layout="vertical" style={{ padding: "1rem" }}>
                    <Form.Item label="Имя" name="name" rules={[{ required: true, message: "Введите имя!" }]}>
                        <Input prefix={<UserOutlined />} placeholder="Введите имя" style={{ borderRadius: 4 }} />
                    </Form.Item>
                    <Form.Item label="Возраст" name="age" rules={[{ required: true, message: "Введите возраст!" }]}>
                        <Input prefix={<UserOutlined />} type="number" placeholder="Введите возраст" style={{ borderRadius: 4 }} />
                    </Form.Item>
                    <Form.Item label="Город" name="city" rules={[{ required: true, message: "Введите город!" }]}>
                        <Input prefix={<HomeOutlined />} placeholder="Введите город" style={{ borderRadius: 4 }} />
                    </Form.Item>
                    <Form.Item label={<span><InfoCircleOutlined style={{ marginRight: 8 }} /> Биография</span>} name="bio">
                        <Input.TextArea placeholder="Расскажите о себе" style={{ borderRadius: 4, minHeight: 100 }} />
                    </Form.Item>
                    <Form.Item label={<span><HeartOutlined style={{ marginRight: 8 }} /> Интересы</span>}>
                        <Select
                            mode="multiple"
                            value={selectedInterests}
                            onChange={setSelectedInterests}
                            placeholder="Выберите интересы"
                            style={{ borderRadius: 4, width: "100%" }}
                        >
                            {interests.map((interest) => (
                                <Option key={interest.id} value={interest.id}>{interest.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Фото">
                        <Upload
                            fileList={fileList}
                            customRequest={handleUpload}
                            onChange={handleUploadChange}
                            onRemove={handleRemovePhoto}
                            listType="picture-card"
                        >
                            <Button icon={<UploadOutlined />} style={{ borderRadius: 4 }}>Загрузить фото</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ borderRadius: 4, marginRight: 10 }}>
                            Сохранить
                        </Button>
                        {!isNewProfile && profileId && (
                            <Button type="primary" danger onClick={handleDelete} style={{ borderRadius: 4 }}>
                                Удалить
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
}

export default EditProfile;

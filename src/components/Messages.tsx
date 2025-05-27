import { useState, useEffect, useRef } from "react";
import { Input, Button, Select, message, Avatar, Spin } from "antd";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getMessages, sendMessage, getMatches, getProfileById } from "../api/api";
import { Message } from "../api/api";
import { AxiosError } from "axios";

const { Option } = Select;

const defaultAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const Messages = () => {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [receiverId, setReceiverId] = useState<number | null>(null);
    const [matches, setMatches] = useState<{ profileId: number; userId: number; name: string; photo?: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState<{ userId: number; name: string; photo?: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (authLoading || !user?.id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Получаем совпадения (matches) с profileId и userId
                const matchesRes = await getMatches(user.profile?.id || user.id, 18, 99);
                const matchList = await Promise.all(
                    matchesRes.data.map(async (match: any) => {
                        const profile = await getProfileById(match.id); // Получаем полный профиль для userId
                        return {
                            profileId: match.id!,
                            userId: profile.data.userId || match.userId, // Берем userId из профиля
                            name: match.name || `User ${match.id}`,
                            photo: match.photos?.[0]?.url || defaultAvatar,
                        };
                    })
                ).then((list) => list.filter((match) => match.userId !== user.id));
                console.log("Matches received:", matchList);
                setMatches(matchList);

                let newConversations = [...matchList.map((m) => ({ userId: m.userId, name: m.name, photo: m.photo }))];

                // Добавляем receiverId из URL, если он есть и существует в conversations
                const searchParams = new URLSearchParams(location.search);
                const urlReceiverId = searchParams.get("receiverId");
                if (urlReceiverId) {
                    const id = parseInt(urlReceiverId, 10);
                    console.log("URL receiverId:", id, "user.id:", user.id);
                    if (!isNaN(id) && id !== user.id && !newConversations.some((conv) => conv.userId === id)) {
                        const match = matchList.find((m) => m.userId === id);
                        if (match) {
                            newConversations = [...newConversations, { userId: match.userId, name: match.name, photo: match.photo }];
                        } else {
                            console.warn("Match not found for receiverId:", id);
                            message.warning("Пользователь не найден среди совпадений!");
                            setReceiverId(null);
                        }
                    } else if (id === user.id) {
                        console.warn("Invalid receiverId (same as user.id):", id);
                        message.warning("Нельзя отправить сообщение самому себе!");
                        setReceiverId(null);
                    }
                    setReceiverId(id); // Устанавливаем receiverId из URL
                }

                setConversations(newConversations);

                // Получаем сообщения
                const messagesRes = await getMessages(user.id);
                const allMessages = messagesRes.data;
                setMessages(allMessages);
            } catch (err) {
                console.error("Error fetching data:", err);
                message.error("Ошибка загрузки данных.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [user?.id, user?.profile?.id, authLoading, location.search, navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, receiverId]);

    const handleSelectConversation = (id: number) => {
        console.log("Selecting conversation userId:", id, "user.id:", user?.id);
        if (id === user?.id) {
            message.warning("Вы не можете начать чат с самим собой!");
            return;
        }
        setReceiverId(id);
        navigate(`/messages?receiverId=${id}`, { replace: true });
    };

    const handleSend = async () => {
        if (!newMessage.trim()) {
            message.warning("Введите текст сообщения!");
            return;
        }
        if (!receiverId) {
            message.warning("Выберите получателя!");
            return;
        }
        if (!user?.id) {
            message.error("Пользователь не авторизован!");
            return;
        }
        console.log("Sending message - user.id:", user.id, "receiverId:", receiverId);
        if (receiverId === user.id) {
            message.warning("Вы не можете отправить сообщение самому себе!");
            return;
        }

        const messageDto = { senderId: user.id.toString(), receiverId: receiverId.toString(), text: newMessage };
        try {
            const response = await sendMessage(messageDto);
            setMessages((prevMessages) =>
                [...prevMessages, response.data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            );
            setNewMessage("");
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Error sending message:", err.response?.data || err.message);
                message.error("Ошибка отправки сообщения: " + (err.response?.data?.message || "Неизвестная ошибка"));
            } else {
                console.error("Unexpected error:", err);
                message.error("Неизвестная ошибка при отправке сообщения");
            }
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const filteredMessages = receiverId
        ? messages
            .filter(
                (msg) =>
                    (msg.senderId === user!.id && msg.receiverId === receiverId) ||
                    (msg.senderId === receiverId && msg.receiverId === user!.id)
            )
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        : [];

    if (authLoading) {
        return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
    }

    return (
        <div className="flex h-screen bg-gray-100" style={{ paddingTop: "20px" }}>
            <div className="w-1/4 bg-white shadow-lg overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-bold mb-4" style={{ lineHeight: "1.2" }}>
                        Чаты
                    </h2>
                    {loading ? (
                        <p className="text-center">Загрузка...</p>
                    ) : conversations.length === 0 ? (
                        <p className="text-center text-gray-500">Нет активных чатов</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.userId}
                                onClick={() => handleSelectConversation(conv.userId)}
                                className={`cursor-pointer p-3 hover:bg-gray-100 ${
                                    receiverId === conv.userId ? "bg-blue-50" : ""
                                } flex items-center`}
                            >
                                <Avatar src={conv.photo || defaultAvatar} size={40} className="mr-3" />
                                <div>
                                    <p className="font-medium">{conv.name}</p>
                                    {messages
                                        .filter(
                                            (msg) =>
                                                (msg.senderId === user!.id && msg.receiverId === conv.userId) ||
                                                (msg.senderId === conv.userId && msg.receiverId === user!.id)
                                        )
                                        .slice(-1)
                                        .map((msg) => (
                                            <p key={msg.id} className="text-sm text-gray-500 truncate">
                                                {msg.text}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        ))
                    )}
                    <Select
                        value={receiverId}
                        onChange={(value) => handleSelectConversation(value)}
                        placeholder="Новый чат"
                        className="w-full mt-4"
                        disabled={matches.length === 0}
                    >
                        {matches
                            .filter((match) => match.userId !== user?.id && !conversations.some((conv) => conv.userId === match.userId))
                            .map((match) => (
                                <Option key={match.userId} value={match.userId} className="flex items-center">
                                    <Avatar src={match.photo || defaultAvatar} size={20} className="mr-2" />
                                    {match.name}
                                </Option>
                            ))}
                    </Select>
                </div>
            </div>

            <div className="w-3/4 flex flex-col">
                {receiverId ? (
                    <>
                        <div className="bg-white p-4 shadow-md flex items-center">
                            <Avatar
                                src={matches.find((m) => m.userId === receiverId)?.photo || defaultAvatar}
                                size={40}
                                className="mr-3"
                            />
                            <h2 className="text-xl font-bold">
                                {matches.find((m) => m.userId === receiverId)?.name || `User ${receiverId}`}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-50 p-4" style={{ height: "calc(100vh - 140px)" }}>
                            {filteredMessages.length === 0 ? (
                                <p className="text-center text-gray-500 mt-10">Нет сообщений</p>
                            ) : (
                                <div className="space-y-3">
                                    {filteredMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex items-end ${
                                                msg.senderId === user!.id ? "justify-end" : "justify-start"
                                            }`}
                                        >
                                            {msg.senderId !== user?.id && (
                                                <Avatar
                                                    src={
                                                        matches.find((m) => m.userId === msg.senderId)?.photo ||
                                                        defaultAvatar
                                                    }
                                                    size={30}
                                                    className="mr-2"
                                                />
                                            )}
                                            <div
                                                className={`max-w-xs p-3 rounded-lg ${
                                                    msg.senderId === user!.id
                                                        ? "bg-blue-500 text-white rounded-br-none"
                                                        : "bg-white text-black shadow-md rounded-bl-none"
                                                }`}
                                            >
                                                <p>{msg.text}</p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        msg.senderId === user!.id ? "text-blue-100" : "text-gray-500"
                                                    }`}
                                                >
                                                    {formatTimestamp(msg.timestamp)}
                                                </p>
                                            </div>
                                            {msg.senderId === user!.id && (
                                                <Avatar
                                                    src={user?.profile?.photos?.[0]?.url || defaultAvatar}
                                                    size={30}
                                                    className="ml-2"
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-4 shadow-md flex items-center space-x-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onPressEnter={handleSend}
                                placeholder="Напишите сообщение..."
                                className="flex-1 rounded-full border-gray-300 focus:border-blue-500"
                            />
                            <Button
                                type="primary"
                                onClick={handleSend}
                                disabled={!receiverId || !newMessage.trim() || !user?.id}
                                className="rounded-full"
                            >
                                Отправить
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <p className="text-gray-500 text-lg">Выберите чат или начните новый</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
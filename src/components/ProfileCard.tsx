import { Card } from "antd";
import { Link } from "react-router-dom";

interface Profile {
    id?: number;
    name?: string;
    age?: number;
    city?: string;
    interests?: { name: string }[];
}

const ProfileCard = ({ profile }: { profile: Profile }) => (
    <Card
        title={profile.name || "Без имени"}
        hoverable
        style={{ width: 300, margin: 16 }}
        cover={
            <div style={{ height: 200, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {profile.name ? "Фото" : "Нет фото"}
            </div>
        }
    >
        <p>Возраст: {profile.age || "Не указан"}</p>
        <p>Город: {profile.city || "Не указан"}</p>
        <p>Интересы: {profile.interests?.map((i) => i.name).join(", ") || "Нет интересов"}</p>
        <Link to={`/profile/${profile.id}`}>Подробнее</Link>
    </Card>
);

export default ProfileCard;
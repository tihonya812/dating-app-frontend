import { Card, Typography, Space } from "antd";
import { GithubOutlined, SendOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

function About() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "20px" }}>
            <Card style={{ maxWidth: 600, textAlign: "center" }}>
                <Title level={2}>О нас</Title>
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.6", color: "#555" }}>
                    Добро пожаловать в Dating App — место, где вы можете найти свою любовь или новых друзей!
                    Наше приложение создано для того, чтобы объединять людей с общими интересами, помогать заводить знакомства
                    и делиться яркими моментами. Мы верим, что каждый заслуживает счастья, и наша цель — сделать процесс знакомства
                    простым, безопасным и увлекательным.
                </Paragraph>
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.6", color: "#555" }}>
                    Присоединяйтесь к нашему сообществу, создавайте свой профиль, находите единомышленников и начинайте общаться уже сегодня!
                </Paragraph>
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.6", marginTop: "2rem" }}>
                    <strong>Свяжитесь с создателем:</strong>
                    <br />
                    <Space size="large" style={{ marginTop: "1rem" }}>
                        <a
                            href="https://t.me/gutsyhawkk"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0088cc", fontSize: "18px", display: "flex", alignItems: "center" }}
                        >
                            <SendOutlined style={{ marginRight: "8px", fontSize: "24px" }} />
                            @gutsyhawkk
                        </a>
                        <a
                            href="https://github.com/tihonya812"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#333", fontSize: "18px", display: "flex", alignItems: "center" }}
                        >
                            <GithubOutlined style={{ marginRight: "8px", fontSize: "24px" }} />
                            tihonya812
                        </a>
                    </Space>
                </Paragraph>
            </Card>
        </div>
    );
}

export default About;
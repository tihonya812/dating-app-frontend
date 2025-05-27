import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { Layout } from "antd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import About from "./pages/About";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Messages from "./components/Messages";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import "antd/dist/reset.css";

const { Content } = Layout;

function App() {
  return (
      <ConfigProvider>
        <AuthProvider>
          <Router>
            <Layout style={{ minHeight: "100vh" }}>
              <Navbar />
              <Content style={{ padding: "2rem", marginTop: "20px" }}> {/* Уменьшен marginTop с 64px до 20px */}
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/about" element={<About />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path="/profile/edit/:id" element={<EditProfile />} />
                    <Route path="/profile/new" element={<EditProfile />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/messages" element={<Messages />} />
                  </Route>
                </Routes>
              </Content>
            </Layout>
          </Router>
        </AuthProvider>
      </ConfigProvider>
  );
}

export default App;
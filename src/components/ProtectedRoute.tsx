import { useAuth } from "../context/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

const ProtectedRoute = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else if (role !== "ADMIN" && window.location.pathname.startsWith("/admin")) {
            navigate("/");
        }
    }, [user, role, navigate]);

    return user ? <Outlet /> : null;
};

export default ProtectedRoute;
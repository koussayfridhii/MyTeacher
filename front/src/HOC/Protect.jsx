import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const withAuthorization = (Component, requiredRoles) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    useEffect(() => {
      if (!user.isLoggedIn) {
        navigate("/login");
        return;
      }

      const hasRequiredRole = requiredRoles.some(
        (role) => user.user.role === role
      );
      if (!hasRequiredRole) {
        navigate("/");
      }
    }, [user.isLoggedIn, requiredRoles, navigate]);

    return <Component {...props} />;
  };

  return AuthComponent;
};

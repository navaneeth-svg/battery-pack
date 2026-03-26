import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decodedToken = jwtDecode(storedToken);
      setUser(decodedToken);
      setRole(decodedToken.role);
      setToken(storedToken);
    }
  }, []);

  const authValues = useMemo(() => ({ user, setUser, token, setToken,  role, setRole }), [user, token, role]);

  return <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useTitle must be used within a TitleProvider");
  }
  return context;
};

export { AuthProvider, useAuth };

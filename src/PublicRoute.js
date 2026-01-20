// src/PublicRoute.js
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

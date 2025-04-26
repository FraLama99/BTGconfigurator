import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../utlis/AuthContext";

/**
 * Componente per proteggere le rotte amministrative
 * Consente l'accesso solo agli utenti autenticati con ruolo "admin"
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Mostra un indicatore di caricamento mentre verifichiamo l'autenticazione
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }

  // Se l'utente è autenticato ma non è admin, reindirizza alla home con messaggio di accesso negato
  if (!isAdmin) {
    return <Navigate to="/" state={{ accessDenied: true }} />;
  }

  // Se l'utente è autenticato ed è admin, consenti l'accesso
  return <Outlet />;
};

export default AdminRoute;

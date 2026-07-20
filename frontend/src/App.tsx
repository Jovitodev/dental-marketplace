import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import OfficeList from "./pages/OfficeList";
import OfficeForm from "./pages/OfficeForm";
import OfficeDetails from "./pages/OfficeDetails";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ReceivedProposals from "./pages/Proposals/Received";
import SentProposals from "./pages/Proposals/Sent";

// Layout raiz + definição de rotas.
// Para novos módulos (ex: /chat, /reviews), adicione novas <Route> aqui
// e crie as respectivas pastas em src/pages.

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OfficeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offices/new"
          element={
            <ProtectedRoute>
              <OfficeForm />
            </ProtectedRoute>
          }
        />
        <Route path="/offices/:id" element={<OfficeDetails />} />
        <Route
          path="/offices/:id/edit"
          element={
            <ProtectedRoute>
              <OfficeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/received"
          element={
            <ProtectedRoute>
              <ReceivedProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/sent"
          element={
            <ProtectedRoute>
              <SentProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

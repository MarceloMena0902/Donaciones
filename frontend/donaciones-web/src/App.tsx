// src/App.tsx
import { Routes, Route } from "react-router-dom";

// Público
import Home from "./pages/Home";
import MapaDonantes from "./pages/MapaDonantes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Privado (Protegidas)
import DonationDashboard from "./pages/DonationDashboard";
import CreateDonation from "./pages/CreateDonation";
import DonationDetails from "./pages/DonationDetails";
import EditDonation from "./pages/EditDonation";
import DeleteDonation from "./pages/DeleteDonation";
import DonationView from "./pages/DonationView ";
import ChatWindow from "./pages/ChatWindow";
import ProfileView from "./pages/ProfileView";
import ChatList from "./pages/ChatList";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ----------- PÚBLICO ----------- */}
      <Route path="/" element={<Home />} />
      <Route path="/mapa-donantes" element={<MapaDonantes />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/chats" element={<ChatList />} />
      {/* ----------- PRIVADO (AUTH REQUIRED) ----------- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DonationDashboard />
          </ProtectedRoute>
        }
      />
  <Route path="/chat/:chatId" element={<ChatWindow />} />

      <Route
        path="/crear-donacion"
        element={
          <ProtectedRoute>
            <CreateDonation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donations/:id"
        element={
          <ProtectedRoute>
            <DonationDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donations/:id/editar"
        element={
          <ProtectedRoute>
            <EditDonation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donations/:id/eliminar"
        element={
          <ProtectedRoute>
            <DeleteDonation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donation/:id"
        element={
          <ProtectedRoute>
            <DonationView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:donorId"
        element={
          <ProtectedRoute>
            <ChatWindow />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfileView />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;

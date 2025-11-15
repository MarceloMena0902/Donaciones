// src/App.tsx
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MapaDonantes from "./pages/MapaDonantes";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DonationDashboard from "./pages/DonationDashboard";
import CreateDonation from "./pages/CreateDonation";
import DonationDetails from "./pages/DonationDetails";
import EditDonation from "./pages/EditDonation";
import DeleteDonation from "./pages/DeleteDonation";

function App() {
  return (
    <Routes>

      {/* PÚBLICO */}
      <Route path="/" element={<Home />} />
      <Route path="/mapa-donantes" element={<MapaDonantes />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* DONACIONES */}
      <Route path="/dashboard" element={<DonationDashboard />} />
      <Route path="/crear-donacion" element={<CreateDonation />} />

      {/* CRUD DONACIÓN */}
      <Route path="/donations/:id" element={<DonationDetails />} />
      <Route path="/donations/:id/editar" element={<EditDonation />} />
      <Route path="/donations/:id/eliminar" element={<DeleteDonation />} />

    </Routes>
  );
}

export default App;

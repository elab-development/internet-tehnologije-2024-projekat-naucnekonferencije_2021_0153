// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profil from "./pages/Profil";
import Konferencije from "./pages/Konferencije";
import ConferenceDetails from "./pages/ConferenceDetails";
import ProtectedRoute from "./routing/ProtectedRoute";
import SubmitNew from "./pages/SubmitNew"; // <-- NOVO
import "./App.css";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminTicketTypes from "./pages/admin/AdminTicketTypes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/conferences" element={<Konferencije />} />
          <Route path="/conferences/:id" element={<ConferenceDetails />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            }
          />

        {/* rute za seminarski */}

          <Route
            path="/submissions/new"
            element={
              <ProtectedRoute roles={["attendee", "author"]}>
                <SubmitNew />
              </ProtectedRoute>
            }
          />
 
           <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
           <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
                      path="/admin/conferences/:id/tickets"
                      element={
                        <ProtectedRoute roles={["admin"]}>
                          <AdminTicketTypes />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                  <Footer />
                </BrowserRouter>
              </AuthProvider>
            );
}

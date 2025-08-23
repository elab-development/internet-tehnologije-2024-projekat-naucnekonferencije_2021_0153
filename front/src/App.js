import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import ProtectedRoute from "./routing/ProtectedRoute";
 import './App.css';
import Register from "./pages/Register";
import Profil from "./pages/Profil";
import Konferencije from "./pages/Konferencije";
import ConferenceDetails from "./pages/ConferenceDetails";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            
          {/*  zaštićene rute */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            }
          /> 
          <Route
            path="/conferences"
            element={
               <ProtectedRoute>
               <Konferencije />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conferences/:id"
            element={
               <ProtectedRoute>
               <ConferenceDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

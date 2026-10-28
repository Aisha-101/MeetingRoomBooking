
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoomsPage from "./pages/RoomsPage";
import UsersPage from "./pages/UsersPage";
import ReservationsPage from "./pages/ReservationsPage";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Navigate to="/rooms" replace />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route
                    path="/reservations"
                    element={<ReservationsPage />}
                />
                <Route path="*" element={<Navigate to="/rooms" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

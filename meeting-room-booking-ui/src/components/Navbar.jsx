
import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/rooms" className="navbar-brand">
                <span className="navbar-logo">▦</span>
                <span>Meeting Room Booking</span>
            </NavLink>

            <div className="navbar-links">
                <NavLink
                    to="/rooms"
                    className={({ isActive }) =>
                        `navbar-link ${isActive ? "selected" : ""}`
                    }
                >
                    Rooms
                </NavLink>

                <NavLink
                    to="/users"
                    className={({ isActive }) =>
                        `navbar-link ${isActive ? "selected" : ""}`
                    }
                >
                    Users
                </NavLink>

                <NavLink
                    to="/reservations"
                    className={({ isActive }) =>
                        `navbar-link ${isActive ? "selected" : ""}`
                    }
                >
                    Reservations
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;


import { useEffect, useState } from "react";
import { getRooms } from "./api/rooms";
import { getUsers } from "./api/users";
import { getReservations } from "./api/reservations";
import "./App.css";

const equipmentNames = [
    "Projector",
    "TV screen",
    "Video conferencing",
    "Whiteboard",
];

function formatDateTime(value) {
    return new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function App() {
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [roomsData, usersData, reservationsData] =
                    await Promise.all([
                        getRooms(),
                        getUsers(),
                        getReservations(),
                    ]);

                setRooms(roomsData);
                setUsers(usersData);
                setReservations(reservationsData);
            } catch (err) {
                setError(err.message || "Failed to load data.");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return <main className="page"><p>Loading data...</p></main>;
    }

    if (error) {
        return (
            <main className="page">
                <h1>Meeting Room Booking</h1>
                <p className="error-message">{error}</p>
            </main>
        );
    }

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">WORKSPACE MANAGEMENT</p>
                    <h1>Meeting Room Booking</h1>
                    <p className="subtitle">
                        Manage rooms, reservations, and users.
                    </p>
                </div>
            </header>

            <section className="rooms-section">
                <div className="section-header">
                    <h2>Meeting rooms</h2>
                    <p>{rooms.length} rooms</p>
                </div>

                <div className="rooms-grid">
                    {rooms.map((room) => {
                        const isActive = room.status === 0;

                        return (
                            <article className="room-card" key={room.id}>
                                <div className="room-card-header">
                                    <div className="room-icon">▦</div>
                                    <span className={`status-badge ${
                                        isActive ? "active" : "inactive"
                                    }`}>
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <h3>{room.name}</h3>

                                <div className="room-details">
                                    <div className="detail-row">
                                        <span className="detail-label">
                                            Capacity
                                        </span>
                                        <strong>{room.capacity} people</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">
                                            Location
                                        </span>
                                        <strong>{room.location}</strong>
                                    </div>
                                </div>

                                <div className="equipment-section">
                                    <h4>Equipment</h4>
                                    <div className="equipment-list">
                                        {room.equipment?.map((item, index) => (
                                            <span
                                                className="equipment-tag"
                                                key={`${item}-${index}`}
                                            >
                                                {equipmentNames[item]
                                                    ?? "Unknown"}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="data-section">
                <div className="section-header">
                    <h2>Reservations</h2>
                    <p>{reservations.length} reservations</p>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Organizer</th>
                                <th>Meeting title</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Attendees</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id}>
                                    <td>{reservation.room}</td>
                                    <td>{reservation.organizer}</td>
                                    <td>{reservation.meetingTitle}</td>
                                    <td>{formatDateTime(reservation.startTime)}</td>
                                    <td>{formatDateTime(reservation.endTime)}</td>
                                    <td>{reservation.attendeeCount}</td>
                                    <td>
                                        <span className={`status-badge ${
                                            reservation.status.toLowerCase()
                                        }`}>
                                            {reservation.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {reservations.length === 0 && (
                        <p className="empty-message">
                            No reservations found.
                        </p>
                    )}
                </div>
            </section>

            <section className="data-section">
                <div className="section-header">
                    <h2>Users</h2>
                    <p>{users.length} users</p>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>First name</th>
                                <th>Last name</th>
                                <th>Email</th>
                                <th>Active reservations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className="count-badge">
                                            {user.reservationCount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <p className="empty-message">No users found.</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default App;

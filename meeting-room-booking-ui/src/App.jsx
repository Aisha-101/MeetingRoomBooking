
import { useEffect, useState } from "react";
import { getRooms } from "./api/rooms";
import "./App.css";

const equipmentNames = [
    "Projector",
    "TV screen",
    "Video conferencing",
    "Whiteboard",
];

function App() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadRooms() {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        loadRooms();
    }, []);

    if (loading) {
        return (
            <main className="page">
                <p className="message">Loading meeting rooms...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="page">
                <h1>Meeting Room Booking</h1>
                <p className="error-message">{error}</p>
                <p>
                    Check that the backend is running at
                    {" "}http://localhost:5200.
                </p>
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
                        Find the right space for your next meeting.
                    </p>
                </div>

                <div className="room-count">
                    <span>{rooms.length}</span>
                    <span>
                        {rooms.length === 1 ? "room" : "rooms"}
                    </span>
                </div>
            </header>

            <section className="rooms-section">
                <div className="section-header">
                    <h2>Available rooms</h2>
                    <p>Room information and equipment</p>
                </div>

                {rooms.length === 0 ? (
                    <div className="empty-state">
                        <h3>No meeting rooms found</h3>
                        <p>There are currently no rooms to display.</p>
                    </div>
                ) : (
                    <div className="rooms-grid">
                        {rooms.map((room) => {
                            const isActive = room.status === 0;

                            return (
                                <article
                                    className="room-card"
                                    key={room.id}
                                >
                                    <div className="room-card-header">
                                        <div className="room-icon">
                                            <span aria-hidden="true">
                                                ▦
                                            </span>
                                        </div>

                                        <span
                                            className={
                                                isActive
                                                    ? "status-badge active"
                                                    : "status-badge inactive"
                                            }
                                        >
                                            {isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    <h3>{room.name}</h3>

                                    <div className="room-details">
                                        <div className="detail-row">
                                            <span className="detail-label">
                                                Capacity
                                            </span>
                                            <strong>
                                                {room.capacity}{" "}
                                                {room.capacity === 1
                                                    ? "person"
                                                    : "people"}
                                            </strong>
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

                                        {room.equipment?.length > 0 ? (
                                            <div className="equipment-list">
                                                {room.equipment.map(
                                                    (item, index) => (
                                                        <span
                                                            className="equipment-tag"
                                                            key={`${item}-${index}`}
                                                        >
                                                            {equipmentNames[item]
                                                                ?? "Unknown"}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="no-equipment">
                                                No equipment listed
                                            </p>
                                        )}
                                    </div>

                                    {!isActive && (
                                        <p className="inactive-note">
                                            This room is currently unavailable
                                            for booking.
                                        </p>
                                    )}

                                    <button
                                        className="room-button"
                                        disabled={!isActive}
                                        type="button"
                                        onClick={() => {
                                            alert(
                                                `Booking for ${room.name} will be implemented next.`
                                            );
                                        }}
                                    >
                                        {isActive
                                            ? "Book room"
                                            : "Unavailable"}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default App;

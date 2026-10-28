
import { useEffect, useState } from "react";
import { getRooms } from "../api/rooms";

const equipmentNames = [
    "Projector",
    "TV screen",
    "Video conferencing",
    "Whiteboard",
];

function RoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [minCapacity, setMinCapacity] = useState("");
    const [selectedEquipment, setSelectedEquipment] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");

    useEffect(() => {
        async function loadRooms() {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (err) {
                setError(err.message || "Failed to load rooms.");
            } finally {
                setLoading(false);
            }
        }

        loadRooms();
    }, []);

    const floors = [
        ...new Set(
            rooms
                .map((room) => room.location)
                .filter(Boolean)
        ),
    ].sort();

    const filteredRooms = rooms.filter((room) => {
        const matchesCapacity =
            minCapacity === "" ||
            room.capacity >= Number(minCapacity);

        const matchesEquipment =
            selectedEquipment === "" ||
            room.equipment?.includes(Number(selectedEquipment));

        const matchesFloor =
            selectedFloor === "" ||
            room.location === selectedFloor;

        return (
            matchesCapacity &&
            matchesEquipment &&
            matchesFloor
        );
    });

    if (loading) {
        return (
            <main className="page">
                <p>Loading rooms...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="page">
                <p className="error-message">{error}</p>
            </main>
        );
    }

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">WORKSPACE MANAGEMENT</p>
                    <h1>Meeting rooms</h1>
                    <p className="subtitle">
                        Browse rooms and find the right space for your meeting.
                    </p>
                </div>
            </header>

            <section className="rooms-section">
                <div className="section-header">
                    <h2>All meeting rooms</h2>
                    <p>
                        {filteredRooms.length} of {rooms.length} rooms
                    </p>
                </div>

                <div className="room-filters">
                    <div className="filter-group">
                        <label htmlFor="minCapacity">
                            Minimum capacity
                        </label>
                        <input
                            id="minCapacity"
                            type="number"
                            min="1"
                            placeholder="Any capacity"
                            value={minCapacity}
                            onChange={(event) =>
                                setMinCapacity(event.target.value)
                            }
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="equipment">
                            Equipment
                        </label>
                        <select
                            id="equipment"
                            value={selectedEquipment}
                            onChange={(event) =>
                                setSelectedEquipment(event.target.value)
                            }
                        >
                            <option value="">All equipment</option>
                            <option value="0">Projector</option>
                            <option value="1">TV screen</option>
                            <option value="2">Video conferencing</option>
                            <option value="3">Whiteboard</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="floor">Floor / location</label>
                        <select
                            id="floor"
                            value={selectedFloor}
                            onChange={(event) =>
                                setSelectedFloor(event.target.value)
                            }
                        >
                            <option value="">All floors</option>
                            {floors.map((floor) => (
                                <option key={floor} value={floor}>
                                    {floor}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="reset-filters-button"
                        onClick={() => {
                            setMinCapacity("");
                            setSelectedEquipment("");
                            setSelectedFloor("");
                        }}
                    >
                        Reset filters
                    </button>
                </div>

                <div className="rooms-grid">
                    {filteredRooms.map((room) => {
                        const isActive = room.status === 0;

                        return (
                            <article
                                className="room-card"
                                key={room.id}
                            >
                                <div className="room-card-header">
                                    <div className="room-icon">▦</div>

                                    <span
                                        className={`status-badge ${
                                            isActive ? "active" : "inactive"
                                        }`}
                                    >
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <h3>{room.name}</h3>

                                <p className="room-id">
                                    Room ID: #{room.id}
                                </p>

                                <div className="room-details">
                                    <div className="detail-row">
                                        <span className="detail-label">
                                            Capacity
                                        </span>
                                        <strong>
                                            {room.capacity} people
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

                                    <div className="equipment-list">
                                        {room.equipment?.map(
                                            (item, index) => (
                                                <span
                                                    className="equipment-tag"
                                                    key={`${item}-${index}`}
                                                >
                                                    {equipmentNames[item] ??
                                                        "Unknown"}
                                                </span>
                                            )
                                        )}

                                        {(!room.equipment ||
                                            room.equipment.length === 0) && (
                                            <span className="no-equipment">
                                                No equipment
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!isActive && (
                                    <p className="inactive-note">
                                        This room is unavailable for booking.
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </div>

                {filteredRooms.length === 0 && (
                    <p className="empty-state">
                        No rooms match your filters.
                    </p>
                )}
            </section>
        </main>
    );
}

export default RoomsPage;


import { useEffect, useState } from "react";
import { getRooms } from "../api/rooms";
import { getUsers } from "../api/users";
import { getReservations } from "../api/reservations";

function formatDateTime(value) {
    return new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function toLocalDateTimeInput(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
}
function getNextFullHour() {
    const date = new Date();
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 1);
    return toLocalDateTimeInput(date);
}

function addMinutesToDateTime(value, minutes) {
    if (!value) return "";

    const date = new Date(value);
    date.setMinutes(date.getMinutes() + minutes);

    return toLocalDateTimeInput(date);
}

function ReservationsPage() {
    const [reservations, setReservations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Filter state
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedOrganizer, setSelectedOrganizer] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Create reservation form state
    const [showForm, setShowForm] = useState(false);
    const [meetingRoomId, setMeetingRoomId] = useState("");
    const [userId, setUserId] = useState("");
    const [title, setTitle] = useState("");
    
    const [reservationStart, setReservationStart] = useState(
        getNextFullHour()
    );
    const [reservationEnd, setReservationEnd] = useState(
        addMinutesToDateTime(getNextFullHour(), 60)
    );

    const [attendeeCount, setAttendeeCount] = useState("1");
    const [saving, setSaving] = useState(false);

    async function loadData() {
        const [reservationsData, roomsData, usersData] =
            await Promise.all([
                getReservations(),
                getRooms(),
                getUsers(),
            ]);

        setReservations(reservationsData);
        setRooms(roomsData);
        setUsers(usersData);
    }

    useEffect(() => {
        async function initialLoad() {
            try {
                await loadData();
            } catch (err) {
                setError(err.message || "Failed to load reservations.");
            } finally {
                setLoading(false);
            }
        }

        initialLoad();
    }, []);

    const filteredReservations = reservations.filter((reservation) => {
        const matchesRoom =
            selectedRoom === "" ||
            String(reservation.meetingRoomId) === selectedRoom ||
            reservation.room ===
                rooms.find((room) => String(room.id) === selectedRoom)?.name;

        const matchesOrganizer =
            selectedOrganizer === "" ||
            String(reservation.userId) === selectedOrganizer ||
            reservation.organizer ===
                users.find((user) => String(user.id) === selectedOrganizer)
                    ?.name;

        const matchesStatus =
            selectedStatus === "" ||
            reservation.status === selectedStatus;

        const reservationDate = new Date(reservation.startTime);
        const matchesStartDate =
            startDate === "" ||
            reservationDate >= new Date(`${startDate}T00:00:00`);

        const matchesEndDate =
            endDate === "" ||
            reservationDate <= new Date(`${endDate}T23:59:59.999`);

        return (
            matchesRoom &&
            matchesOrganizer &&
            matchesStatus &&
            matchesStartDate &&
            matchesEndDate
        );
    });

    async function handleCreateReservation(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!meetingRoomId || !userId) {
            setError("Please select a room and an organizer.");
            return;
        }

        if (
            new Date(reservationEnd) <= new Date(reservationStart)
        ) {
            setError("The end time must be after the start time.");
            return;
        }

        const selectedUser = users.find(
            (user) => user.id === Number(userId)
        );

        if (!selectedUser) {
            setError("The selected organizer was not found.");
            return;
        }

        const body = {
            meetingRoomId: Number(meetingRoomId),
            userId: Number(userId),
            title: title.trim(),
            startTime: new Date(reservationStart).toISOString(),
            endTime: new Date(reservationEnd).toISOString(),
            attendeeCount: Number(attendeeCount),
            reservedBy: `${selectedUser.name} ${selectedUser.surname}`,
        };

        try {
            setSaving(true);

            const response = await fetch(
                "http://localhost:5200/api/reservations",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to create reservation."
                );
            }

            await loadData();
            setShowForm(false);
            setTitle("");
            setMeetingRoomId("");
            setUserId("");
            const nextStart = getNextFullHour();

            setReservationStart(nextStart);
            setReservationEnd(addMinutesToDateTime(nextStart, 60));
            setAttendeeCount("1");
            setMessage("Reservation created successfully.");
        } catch (err) {
            setError(err.message || "Failed to create reservation.");
        } finally {
            setSaving(false);
        }
    }

    async function handleReservationAction(id, action) {
        setError("");
        setMessage("");

        const actionText =
            action === "cancel" ? "cancel" : "end this meeting early";

        if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5200/api/reservations/${id}/${action === "cancel" ? "cancel" : "end-early"}`,
                {
                    method: "PATCH",
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Failed to ${actionText}.`
                );
            }

            await loadData();
            setMessage(
                action === "cancel"
                    ? "Reservation cancelled successfully."
                    : "Meeting ended early successfully."
            );
        } catch (err) {
            setError(err.message || "The action failed.");
        }
    }

    if (loading) {
        return (
            <main className="page">
                <p>Loading reservations...</p>
            </main>
        );
    }

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">WORKSPACE MANAGEMENT</p>
                    <h1>Reservations</h1>
                    <p className="subtitle">
                        Create and manage meeting reservations.
                    </p>
                </div>

                <button
                    type="button"
                    className="room-button create-button"
                    onClick={() => {
                        setShowForm(!showForm);
                        setError("");
                        setMessage("");
                    }}
                >
                    {showForm ? "Close form" : "+ New reservation"}
                </button>
            </header>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            {message && (
                <p className="message" role="status">
                    {message}
                </p>
            )}

            {showForm && (
                <section className="reservation-form-section">
                    <h2>Create reservation</h2>

                    <form
                        className="reservation-form"
                        onSubmit={handleCreateReservation}
                    >
                        <div className="filter-group">
                            <label htmlFor="newRoom">Meeting room</label>
                            <select
                                id="newRoom"
                                value={meetingRoomId}
                                onChange={(event) =>
                                    setMeetingRoomId(event.target.value)
                                }
                                required
                            >
                                <option value="">Select a room</option>
                                {rooms
                                    .filter((room) => room.status === 0)
                                    .map((room) => (
                                        <option
                                            key={room.id}
                                            value={room.id}
                                        >
                                            {room.name} — capacity {room.capacity}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="newOrganizer">Organizer</label>
                            <select
                                id="newOrganizer"
                                value={userId}
                                onChange={(event) =>
                                    setUserId(event.target.value)
                                }
                                required
                            >
                                <option value="">Select an organizer</option>
                                {users.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name} {user.surname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="newTitle">Meeting title</label>
                            <input
                                id="newTitle"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                required
                                maxLength={150}
                                placeholder="e.g. Project planning"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="newStart">Start date and time</label>
                            <input
                                id="newStart"
                                type="datetime-local"
                                value={reservationStart}
                                onChange={(event) => {
                                    const newStart = event.target.value;
                                    setReservationStart(newStart);

                                    if (
                                        !reservationEnd ||
                                        new Date(reservationEnd) <= new Date(newStart)
                                    ) {
                                        setReservationEnd(addMinutesToDateTime(newStart, 60));
                                    }
                                }}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="newEnd">End date and time</label>
                            <input
                                id="newEnd"
                                type="datetime-local"
                                value={reservationEnd}
                                onChange={(event) =>
                                    setReservationEnd(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="filter-group">
                            <label>Quick duration</label>

                            <div className="duration-buttons">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setReservationEnd(
                                            addMinutesToDateTime(reservationStart, 30)
                                        )
                                    }
                                    disabled={!reservationStart}
                                >
                                    30 min
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setReservationEnd(
                                            addMinutesToDateTime(reservationStart, 60)
                                        )
                                    }
                                    disabled={!reservationStart}
                                >
                                    1 hour
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setReservationEnd(
                                            addMinutesToDateTime(reservationStart, 120)
                                        )
                                    }
                                    disabled={!reservationStart}
                                >
                                    2 hours
                                </button>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="newAttendees">Attendees</label>
                            <input
                                id="newAttendees"
                                type="number"
                                min="1"
                                value={attendeeCount}
                                onChange={(event) =>
                                    setAttendeeCount(event.target.value)
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="room-button"
                            disabled={saving}
                        >
                            {saving ? "Creating..." : "Create reservation"}
                        </button>
                    </form>
                </section>
            )}

            <section className="data-section">
                <div className="section-header">
                    <h2>All reservations</h2>
                    <p>
                        {filteredReservations.length} of {reservations.length} reservations
                    </p>
                </div>

                <div className="room-filters">
                    <div className="filter-group">
                        <label htmlFor="filterRoom">Room</label>
                        <select
                            id="filterRoom"
                            value={selectedRoom}
                            onChange={(event) =>
                                setSelectedRoom(event.target.value)
                            }
                        >
                            <option value="">All rooms</option>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="filterOrganizer">Organizer</label>
                        <select
                            id="filterOrganizer"
                            value={selectedOrganizer}
                            onChange={(event) =>
                                setSelectedOrganizer(event.target.value)
                            }
                        >
                            <option value="">All organizers</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.surname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="filterStatus">Status</label>
                        <select
                            id="filterStatus"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                        >
                            <option value="">All statuses</option>
                            <option value="Booked">Booked</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="filterStart">From date</label>
                        <input
                            id="filterStart"
                            type="date"
                            value={startDate}
                            onChange={(event) =>
                                setStartDate(event.target.value)
                            }
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="filterEnd">To date</label>
                        <input
                            id="filterEnd"
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(event) =>
                                setEndDate(event.target.value)
                            }
                        />
                    </div>

                    <button
                        type="button"
                        className="reset-filters-button"
                        onClick={() => {
                            setSelectedRoom("");
                            setSelectedOrganizer("");
                            setSelectedStatus("");
                            setStartDate("");
                            setEndDate("");
                        }}
                    >
                        Reset filters
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Room</th>
                                <th>Organizer</th>
                                <th>Meeting title</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Attendees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredReservations.map((reservation) => (
                                <tr key={reservation.id}>
                                    <td>#{reservation.id}</td>
                                    <td>{reservation.room}</td>
                                    <td>{reservation.organizer}</td>
                                    <td>{reservation.meetingTitle}</td>
                                    <td>{formatDateTime(reservation.startTime)}</td>
                                    <td>{formatDateTime(reservation.endTime)}</td>
                                    <td>{reservation.attendeeCount}</td>
                                    <td>
                                        <span
                                            className={`status-badge ${
                                                reservation.status.toLowerCase()
                                            }`}
                                        >
                                            {reservation.status}
                                        </span>
                                    </td>
                                    <td>
                                        {reservation.status === "Booked" && (
                                            <div className="reservation-actions">
                                                <button
                                                    type="button"
                                                    className="action-button cancel-action"
                                                    onClick={() =>
                                                        handleReservationAction(
                                                            reservation.id,
                                                            "cancel"
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    className="action-button end-action"
                                                    onClick={() =>
                                                        handleReservationAction(
                                                            reservation.id,
                                                            "end-early"
                                                        )
                                                    }
                                                >
                                                    End early
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredReservations.length === 0 && (
                        <p className="empty-message">
                            No reservations match your filters.
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default ReservationsPage;

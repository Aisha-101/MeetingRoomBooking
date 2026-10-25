
import { useEffect, useState } from "react";
import { getRooms } from "./api/rooms";

function App() {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRooms()
            .then(setRooms)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading rooms...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <main>
            <h1>Meeting Rooms</h1>

            {rooms.length === 0 ? (
                <p>No rooms available yet.</p>
            ) : (
                <ul>
                    {rooms.map((room) => (
                        <li key={room.id}>
                            <h2>{room.name}</h2>
                            <p>Capacity: {room.capacity}</p>
                            <p>Location: {room.location}</p>
                            <p>Status: {room.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default App;

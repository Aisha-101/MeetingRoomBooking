
import { useEffect, useState } from "react";
import { getUsers } from "../api/users";

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (err) {
                setError(err.message || "Failed to load users.");
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, []);

    if (loading) {
        return (
            <main className="page">
                <p>Loading users...</p>
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
                    <h1>Users</h1>
                    <p className="subtitle">
                        View users and their active reservations.
                    </p>
                </div>
            </header>

            <section className="data-section">
                <div className="section-header">
                    <h2>All users</h2>
                    <p>{users.length} users</p>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Unique ID</th>
                                <th>First name</th>
                                <th>Last name</th>
                                <th>Active reservations</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
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
                        <p className="empty-message">
                            No users found.
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default UsersPage;

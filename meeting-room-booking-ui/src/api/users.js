const API_URL = "http://localhost:5200/api/users";

export async function getUsers() {
    const response = await fetch(API_URL);

    if(!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return response.json();
}
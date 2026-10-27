const API_URL = "http://localhost:5200/api/reservations";

export async function getReservations() {
    const response = await fetch(API_URL);
    
    if(!response.ok) {
        throw new Error("Failed to fetch reservations");
    }

    return response.json();
}
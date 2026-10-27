namespace MeetingRoomBooking.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int ReservationCount { get; set; } //active reservations count
    public List<Reservation> Reservations { get; set; } = new();
}
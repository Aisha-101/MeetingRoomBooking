namespace MeetingRoomBooking.Api.Models;

public class Reservation
{
    public int Id { get; set; }
    public int MeetingRoomId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string ReservedBy { get; set; } = string.Empty;
    public int AttendeeCount { get; set; }
    public ReservationStatusEnum Status { get; set; } = ReservationStatusEnum.Booked;
    public int UserId { get; set; }
    public enum ReservationStatusEnum
    {
        Booked,
        Completed,
        Cancelled
    } 
}
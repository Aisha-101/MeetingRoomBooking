namespace MeetingRoomBooking.Api.Configuration;

public class BookingRulesOptions
{
    public int MaxReservationDurationDays { get; set; }
    public int MaxBookingHorizonDays { get; set; }
}
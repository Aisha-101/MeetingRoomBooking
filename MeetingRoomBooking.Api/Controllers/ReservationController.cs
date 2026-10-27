using MeetingRoomBooking.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoomBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly MeetingRoomContext _context;

    public ReservationsController(MeetingRoomContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetReservations()
    {
        var reservations = await (
            from reservation in _context.Reservations
            join room in _context.MeetingRooms 
                on reservation.MeetingRoomId equals room.Id
            join user in _context.Users
                on reservation.UserId equals user.Id
            select new
            {
                reservation.Id,
                Room = room.Name,
                Organizer = user.Name + " " + user.Surname,
                MeetingTitle = reservation.Title,
                reservation.StartTime,
                reservation.EndTime,
                reservation.AttendeeCount,
                Status = reservation.Status.ToString()
            }
        ).ToListAsync();
        return Ok(reservations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null)
        {
            return NotFound();
        }
        return Ok(reservation);
    }
    
}
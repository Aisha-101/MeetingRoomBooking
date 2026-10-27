using MeetingRoomBooking.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeetingRoomBooking.Api.Models;
using MeetingRoomBooking.Api.Configuration;
using Microsoft.Extensions.Options;


namespace MeetingRoomBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly MeetingRoomContext _context;
    private readonly BookingRulesOptions _bookingRules;

    public ReservationsController(MeetingRoomContext context, IOptions<BookingRulesOptions> bookingRules)
    {
        _context = context;
        _bookingRules = bookingRules.Value;
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

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] Reservation reservation)
    {
        var now = DateTime.Now;

        if (reservation.StartTime <= now)
        {
            return BadRequest(new
            {
                code = "InvalidStartTime",
                message = "The reservation must start in the future."
            });
        }
        
        if (reservation.StartTime > now.AddDays(_bookingRules.MaxBookingHorizonDays))
        {
            return BadRequest(new
            {
                code = "ExceedsBookingHorizon",
                message = $"The reservation cannot be made more than {_bookingRules.MaxBookingHorizonDays} days in advance."
            });
        }

        if (reservation.EndTime <= reservation.StartTime)
        {
            return BadRequest(new
            {
                code = "InvalidTimeRange",
                message = "The reservation end time must be after the start time."
            });
        }

        var duration = reservation.EndTime - reservation.StartTime;

        if(duration.TotalDays > _bookingRules.MaxReservationDurationDays)
        {
            return BadRequest(new
            {
                code = "ExceedsMaxDuration",
                message = $"The reservation duration cannot exceed {_bookingRules.MaxReservationDurationDays} days."
            });
        }

        var room = await _context.MeetingRooms.FindAsync(reservation.MeetingRoomId);
        if (room == null)
        {
            return BadRequest(new
            {
                code = "InvalidMeetingRoom",
                message = "The specified meeting room does not exist."
            });
        }

        if (room.Status != MeetingRoom.StatusEnum.Active)
        {
            return BadRequest(new
            {
                code = "InactiveMeetingRoom",
                message = "The specified meeting room is inactive and cannot be booked."
            });
        }

        if (reservation.AttendeeCount <= 0)
        {
            return BadRequest(new
            {
                code = "InvalidAttendeeCount",
                message = "The attendee count must be greater than zero."
            });
        }

        if (reservation.AttendeeCount > room.Capacity)
        {
            return BadRequest(new
            {
                code = "ExceedsRoomCapacity",
                message = $"The attendee count exceeds the capacity of the meeting room ({room.Capacity})."
            });
        }

        var user = await _context.Users.FindAsync(reservation.UserId);

        if (user == null)
        {
            return BadRequest(new
            {
                code = "InvalidUser",
                message = "The specified user does not exist."
            });
        }

        var roomHasOverlap = await _context.Reservations.AnyAsync(existing =>
            existing.MeetingRoomId == reservation.MeetingRoomId &&
            existing.Status == Reservation.ReservationStatusEnum.Booked &&
            existing.StartTime < reservation.EndTime &&
            reservation.StartTime < existing.EndTime
        );

        if (roomHasOverlap)
        {
            return BadRequest(new
            {
                code = "RoomAlreadyBooked",
                message = "The meeting room is already booked for the specified time range."
            });
        }

        var organizerHasOverlap = await _context.Reservations.AnyAsync(existing =>
            existing.UserId == reservation.UserId &&
            existing.Status == Reservation.ReservationStatusEnum.Booked &&
            existing.StartTime < reservation.EndTime &&
            reservation.StartTime < existing.EndTime
        );

        if (organizerHasOverlap)
        {
            return BadRequest(new
            {
                code = "OrganizerAlreadyBooked",
                message = "You already organize another meeting during the selected time range."
            });
        }

        reservation.Id = 0;
        reservation.Status = Reservation.ReservationStatusEnum.Booked;

    
        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, reservation);
    }

    public async Task<IActionResult> CancelReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null)
        {
            return NotFound();
        }

        reservation.Status = Reservation.ReservationStatusEnum.Cancelled;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
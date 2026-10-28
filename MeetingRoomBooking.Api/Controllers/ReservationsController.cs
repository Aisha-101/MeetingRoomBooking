
using MeetingRoomBooking.Api.Configuration;
using MeetingRoomBooking.Api.Data;
using MeetingRoomBooking.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MeetingRoomBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly MeetingRoomContext _context;
    private readonly BookingRulesOptions _bookingRules;

    public ReservationsController(
        MeetingRoomContext context,
        IOptions<BookingRulesOptions> bookingRules)
    {
        _context = context;
        _bookingRules = bookingRules.Value;
    }

    // GET: api/reservations
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
                reservation.MeetingRoomId,
                reservation.UserId,
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

    // GET: api/reservations/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);

        if (reservation == null)
        {
            return NotFound(new
            {
                code = "ReservationNotFound",
                message = "The reservation does not exist."
            });
        }

        return Ok(reservation);
    }

    // POST: api/reservations
    [HttpPost]
    public async Task<IActionResult> CreateReservation(
        [FromBody] Reservation reservation)
    {
        var now = DateTime.Now;

        // R4: The reservation must start in the future.
        if (reservation.StartTime <= now)
        {
            return BadRequest(new
            {
                code = "InvalidStartTime",
                message = "The reservation must start in the future."
            });
        }

        // R6: The start time cannot exceed the configured booking horizon.
        if (reservation.StartTime >
            now.AddDays(_bookingRules.MaxBookingHorizonDays))
        {
            return BadRequest(new
            {
                code = "ExceedsBookingHorizon",
                message = $"The reservation cannot be made more than " +
                          $"{_bookingRules.MaxBookingHorizonDays} days in advance."
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

        // R1: The duration cannot exceed the configured maximum.
        var duration = reservation.EndTime - reservation.StartTime;

        if (duration.TotalDays > _bookingRules.MaxReservationDurationDays)
        {
            return BadRequest(new
            {
                code = "ExceedsMaxDuration",
                message = $"The reservation duration cannot exceed " +
                          $"{_bookingRules.MaxReservationDurationDays} days."
            });
        }

        // Find the room.
        var room = await _context.MeetingRooms
            .FindAsync(reservation.MeetingRoomId);

        if (room == null)
        {
            return BadRequest(new
            {
                code = "InvalidMeetingRoom",
                message = "The specified meeting room does not exist."
            });
        }

        // R7: Inactive rooms cannot be booked.
        if (room.Status != MeetingRoom.StatusEnum.Active)
        {
            return BadRequest(new
            {
                code = "InactiveMeetingRoom",
                message = "The specified meeting room is inactive and cannot be booked."
            });
        }

        // R5: Validate attendee count.
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
                message = $"The attendee count exceeds the room capacity " +
                          $"of {room.Capacity}."
            });
        }

        // Validate the organizer.
        var user = await _context.Users
            .FindAsync(reservation.UserId);

        if (user == null)
        {
            return BadRequest(new
            {
                code = "InvalidUser",
                message = "The specified user does not exist."
            });
        }

        // R2: Prevent overlapping bookings in the same room.
        var roomHasOverlap = await _context.Reservations.AnyAsync(existing =>
            existing.MeetingRoomId == reservation.MeetingRoomId &&
            existing.Status == Reservation.ReservationStatusEnum.Booked &&
            reservation.StartTime < existing.EndTime &&
            reservation.EndTime > existing.StartTime);

        if (roomHasOverlap)
        {
            return BadRequest(new
            {
                code = "RoomAlreadyBooked",
                message = "The meeting room is already booked during the selected time."
            });
        }

        // R3: Prevent overlapping meetings for the same organizer.
        var organizerHasOverlap = await _context.Reservations.AnyAsync(existing =>
            existing.UserId == reservation.UserId &&
            existing.Status == Reservation.ReservationStatusEnum.Booked &&
            reservation.StartTime < existing.EndTime &&
            reservation.EndTime > existing.StartTime);

        if (organizerHasOverlap)
        {
            return BadRequest(new
            {
                code = "OrganizerAlreadyBooked",
                message = "You already organize another meeting during the selected time."
            });
        }

        // Every new reservation starts with a generated ID and Booked status.
        reservation.Id = 0;
        reservation.Status = Reservation.ReservationStatusEnum.Booked;

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetReservation),
            new { id = reservation.Id },
            reservation);
    }

    // PATCH: api/reservations/5/cancel
    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);

        if (reservation == null)
        {
            return NotFound(new
            {
                code = "ReservationNotFound",
                message = "The reservation does not exist."
            });
        }

        if (reservation.Status != Reservation.ReservationStatusEnum.Booked)
        {
            return BadRequest(new
            {
                code = "ReservationNotActive",
                message = "Only booked reservations can be cancelled."
            });
        }

        reservation.Status = Reservation.ReservationStatusEnum.Cancelled;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH: api/reservations/5/end-early
    [HttpPatch("{id}/end-early")]
    public async Task<IActionResult> EndMeetingEarly(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);

        if (reservation == null)
        {
            return NotFound(new
            {
                code = "ReservationNotFound",
                message = "The reservation does not exist."
            });
        }

        if (reservation.Status != Reservation.ReservationStatusEnum.Booked)
        {
            return BadRequest(new
            {
                code = "ReservationNotActive",
                message = "Only booked reservations can be ended early."
            });
        }

        var now = DateTime.Now;

        if (now <= reservation.StartTime)
        {
            return BadRequest(new
            {
                code = "MeetingNotStarted",
                message = "A meeting can only be ended after it has started."
            });
        }

        reservation.EndTime = now;
        reservation.Status = Reservation.ReservationStatusEnum.Completed;

        await _context.SaveChangesAsync();

        return Ok(reservation);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReservation(int id, [FromBody] Reservation updatedReservation)
    {
        var reservation = await _context.Reservations.FindAsync(id);

        if (reservation == null)
        {
            return NotFound(new
            {
                code = "ReservationNotFound",
                message = "The reservation does not exist."
            });
        }
        
        if (reservation.Status != Reservation.ReservationStatusEnum.Booked)
        {
            return BadRequest(new
            {
                code = "ReservationNotActive",
                message = "Only booked reservations can be updated."
            });
        }

        var now = DateTime.Now;

        if (updatedReservation.StartTime <= now)
        {
            return BadRequest(new
            {
                code = "InvalidStartTime",
                message = "The reservation must start in the future."
            });
        }

        if (updatedReservation.StartTime > now.AddDays(_bookingRules.MaxBookingHorizonDays))
        {
            return BadRequest(new
            {
                code = "ExceedsBookingHorizon",
                message = $"The reservation cannot be made more than {_bookingRules.MaxBookingHorizonDays} days in advance."
            });
        }

        if (updatedReservation.EndTime <= updatedReservation.StartTime)
        {
            return BadRequest(new
            {
                code = "InvalidTimeRange",
                message = "The reservation end time must be after the start time."
            });
        }

        var duration = updatedReservation.EndTime - updatedReservation.StartTime;
        if (duration.TotalDays > _bookingRules.MaxReservationDurationDays)
        {
            return BadRequest(new
            {
                code = "ExceedsMaxDuration",
                message = $"The reservation duration cannot exceed {_bookingRules.MaxReservationDurationDays} days."
            });
        }

        var room = await _context.MeetingRooms.FindAsync(updatedReservation.MeetingRoomId);

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

        if (updatedReservation.AttendeeCount <= 0)
        {
            return BadRequest(new
            {
                code = "InvalidAttendeeCount",
                message = "The attendee count must be greater than zero."
            });
        }

        if (updatedReservation.AttendeeCount > room.Capacity)
        {
            return BadRequest(new
            {
                code = "ExceedsRoomCapacity",
                message = $"The attendee count exceeds the room capacity of {room.Capacity}."
            });
        }

        var user = await _context.Users.FindAsync(updatedReservation.UserId);

        if (user == null)
        {
            return BadRequest(new
            {
                code = "InvalidUser",
                message = "The specified user does not exist."
            });
        }

        var roomHasOverlap = await _context.Reservations.AnyAsync(existing =>
            existing.Id != id &&
            existing.MeetingRoomId == updatedReservation.MeetingRoomId &&
            existing.Status == Reservation.ReservationStatusEnum.Booked &&
            updatedReservation.StartTime < existing.EndTime &&
            updatedReservation.EndTime > existing.StartTime);
            await _context.SaveChangesAsync();

        if (roomHasOverlap)
        {
            return BadRequest(new
            {
                code = "RoomAlreadyBooked",
                message = "The meeting room is already booked during the selected time."
            });
        }

        var organizerHasOverlap = await _context.Reservations.AnyAsync(existing =>
            existing.Id != id &&
            existing.UserId == updatedReservation.UserId &&
            existing.Status == Reservation.ReservationStatusEnum.Booked &&
            updatedReservation.StartTime < existing.EndTime &&
            updatedReservation.EndTime > existing.StartTime);

        if (organizerHasOverlap)
        {
            return BadRequest(new
            {
                code = "OrganizerAlreadyBooked",
                message = "You already organize another meeting during the selected time."
            });
        }    

        reservation.MeetingRoomId = updatedReservation.MeetingRoomId;
        reservation.Title = updatedReservation.Title;
        reservation.StartTime = updatedReservation.StartTime;
        reservation.EndTime = updatedReservation.EndTime;
        reservation.UserId = updatedReservation.UserId;
        reservation.ReservedBy = $"{user.Name} {user.Surname}";
        reservation.AttendeeCount = updatedReservation.AttendeeCount;
        
        await _context.SaveChangesAsync();

        return Ok(reservation);
    }
}

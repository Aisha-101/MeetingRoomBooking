using MeetingRoomBooking.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeetingRoomBooking.Api.Models;

namespace MeetingRoomBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly MeetingRoomContext _context;

    public UsersController(MeetingRoomContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(user => new
            {
                user.Id,
                user.Name,
                user.Surname,
                user.Email,
                ReservationCount = _context.Reservations.Count(
                    reservation =>
                    reservation.UserId == user.Id &&
                    reservation.Status == Reservation.ReservationStatusEnum.Booked
                )
            }).ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }
}
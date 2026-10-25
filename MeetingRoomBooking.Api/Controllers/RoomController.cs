using MeetingRoomBooking.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoomBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly MeetingRoomContext _context;

    public RoomsController(MeetingRoomContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms()
    {
        var rooms = await _context.MeetingRooms.ToListAsync();
        return Ok(rooms);
    }
}
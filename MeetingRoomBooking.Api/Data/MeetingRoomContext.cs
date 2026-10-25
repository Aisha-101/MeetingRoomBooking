using MeetingRoomBooking.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoomBooking.Api.Data;

public class MeetingRoomContext : DbContext
{
    public MeetingRoomContext(DbContextOptions<MeetingRoomContext> options) : base(options)
    {
    }

    public DbSet<MeetingRoom> MeetingRooms =>
        Set<MeetingRoom>();
}
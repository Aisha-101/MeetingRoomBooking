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
    
    public DbSet<Reservation> Reservations =>
        Set<Reservation>();
    public DbSet<User> Users =>
        Set<User>();
}
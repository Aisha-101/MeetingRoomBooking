using MeetingRoomBooking.Api.Data;
using MeetingRoomBooking.Api.Models;
using Microsoft.EntityFrameworkCore;
using MeetingRoomBooking.Api.Configuration;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<MeetingRoomContext>(options => 
    options.UseInMemoryDatabase("MeetingRoomBookingDb"));

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.Configure<BookingRulesOptions>(
    builder.Configuration.GetSection("BookingRules"));
    
var app = builder.Build();

app.UseCors("ReactApp");


using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider
        .GetRequiredService<MeetingRoomContext>();

    if (!context.Users.Any())
    {
        context.Users.AddRange(
            new User
            {
                Id = 1,
                Name = "Aisha",
                Surname = "Example",
                Email = "aisha@example.com"
            },
            new User
            {
                Id = 2,
                Name = "John",
                Surname = "Smith",
                Email = "john@example.com"
            },
            new User
            {
                Id = 3,
                Name = "Emma",
                Surname = "Wilson",
                Email = "emma@example.com"
            }
        );

        context.SaveChanges();
    }

    if (!context.Reservations.Any())
    {
        context.Reservations.AddRange(
            new Reservation
            {
                Id = 1,
                MeetingRoomId = 1,
                UserId = 1,
                Title = "Team Planning",
                ReservedBy = "Aisha Example",
                StartTime = DateTime.Now.AddMinutes(-30),
                EndTime = DateTime.Now.AddMinutes(30),
                AttendeeCount = 4,
                Status = Reservation.ReservationStatusEnum.Booked
            },
            new Reservation
            {
                Id = 2,
                MeetingRoomId = 2,
                UserId = 2,
                Title = "Project Review",
                ReservedBy = "John Smith",
                StartTime = DateTime.Today.AddDays(2).AddHours(13),
                EndTime = DateTime.Today.AddDays(2).AddHours(14),
                AttendeeCount = 6,
                Status = Reservation.ReservationStatusEnum.Booked
            },
            new Reservation
            {
                Id = 3,
                MeetingRoomId = 2,
                UserId = 1,
                Title = "Requirements Discussion",
                ReservedBy = "Aisha Example",
                StartTime = DateTime.Today.AddDays(-2).AddHours(10),
                EndTime = DateTime.Today.AddDays(-2).AddHours(11),
                AttendeeCount = 5,
                Status = Reservation.ReservationStatusEnum.Completed
            },
            new Reservation
            {
                Id = 4,
                MeetingRoomId = 1,
                UserId = 3,
                Title = "Design Workshop",
                ReservedBy = "Emma Wilson",
                StartTime = DateTime.Today.AddDays(3).AddHours(9),
                EndTime = DateTime.Today.AddDays(3).AddHours(10),
                AttendeeCount = 2,
                Status = Reservation.ReservationStatusEnum.Cancelled
            }
        );

        context.SaveChanges();
    }
}

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider
        .GetRequiredService<MeetingRoomContext>();

    if (!context.MeetingRooms.Any())
    {
        context.MeetingRooms.AddRange(
            new MeetingRoom
            {
                Name = "Focus Room A",
                Capacity = 4,
                Location = "Floor 1",
                Equipment = new List<MeetingRoom.EquipmentEnum> { MeetingRoom.EquipmentEnum.Whiteboard, MeetingRoom.EquipmentEnum.TVScreen },
                Status = MeetingRoom.StatusEnum.Active
            },
            new MeetingRoom
            {
                Name = "Meeting Room B",
                Capacity = 8,
                Location = "Floor 2",
                Equipment = new List<MeetingRoom.EquipmentEnum> { MeetingRoom.EquipmentEnum.Projector, MeetingRoom.EquipmentEnum.VideoConferencing },
                Status = MeetingRoom.StatusEnum.Active
            },
            new MeetingRoom
            {
                Name = "Conference Room C",
                Capacity = 12,
                Location = "Floor 3",
                Equipment = new List<MeetingRoom.EquipmentEnum> { MeetingRoom.EquipmentEnum.TVScreen, MeetingRoom.EquipmentEnum.Whiteboard },
                Status = MeetingRoom.StatusEnum.Inactive
            }
        );

        context.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

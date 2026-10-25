using MeetingRoomBooking.Api.Data;
using MeetingRoomBooking.Api.Models;
using Microsoft.EntityFrameworkCore;

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

var app = builder.Build();

app.UseCors("ReactApp");

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

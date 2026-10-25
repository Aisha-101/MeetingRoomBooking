namespace MeetingRoomBooking.Api.Models;

public class MeetingRoom
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Location { get; set; } = string.Empty;
    public List<MeetingRoom.EquipmentEnum> Equipment { get; set; } = new List<MeetingRoom.EquipmentEnum>();
    public MeetingRoom.StatusEnum Status { get; set; }

    public enum EquipmentEnum
    {
        Projector,
        TVScreen,
        VideoConferencing,
        Whiteboard
    }
    public enum StatusEnum
    {
        Active,
        Inactive
    }
}
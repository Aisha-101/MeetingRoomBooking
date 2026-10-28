# Meeting Room Booking System

## 1. Overview

Meeting Room Booking is a web application for managing meeting rooms, users, and meeting reservations. It allows users to browse available rooms, create reservations, view booking details, and manage existing reservations.

The application consists of a React frontend and an ASP.NET Core Web API backend. The backend handles business rules and validation, while the frontend provides the user interface.

## 2. Features

### Meeting Rooms
- View meeting room details, including ID, name, capacity, location, equipment, and status.
- Filter rooms by minimum capacity, equipment, and location.
- Distinguish between active and inactive rooms.
- Prevent reservations for inactive rooms.

### Users
- View user IDs, first names, and last names.
- Display the number of active (booked) reservations for each user.

### Reservations
- View reservation details, including room, organizer, title, start and end times, attendee count, and status.
- Create new reservations.
- Cancel existing booked reservations.
- End meetings early.
- Filter reservations by room, organizer, status, and date range.

### Booking Validation
The backend validates reservation requests to enforce booking rules:
- The end time must be later than the start time.
- The start time must be in the future.
- A reservation cannot exceed the configured maximum duration.
- A reservation cannot be made beyond the configured booking horizon.
- The selected room must be active.
- The number of attendees cannot exceed the room's capacity.
- Reservations for the same room cannot overlap.
- The same organizer cannot have overlapping reservations, even in different rooms.
- Cancelled reservations do not block future bookings.

## 3. Technologies Used

### Backend
- C#
- ASP.NET Core Web API
- Entity Framework Core InMemory
- Dependency injection
- Configuration through `appsettings.json`

### Frontend
- React
- JavaScript and JSX
- Vite
- React Router
- CSS

## 4. Architecture

The application follows a client-server architecture.

- **Frontend:** React pages and components display data, collect user input, and send HTTP requests to the backend.
- **Backend:** ASP.NET Core controllers expose API endpoints and enforce booking rules.
- **Models:** Represent meeting rooms, users, and reservations.
- **Data access:** Entity Framework Core InMemory stores application data during runtime.
- **Configuration:** Booking limits are defined in `appsettings.json` and accessed through the options/dependency-injection system.

The frontend and backend are separated so that the user interface does not need to implement the authoritative booking rules itself.

## 5. Prerequisites

Install the following before running the application:

- .NET SDK compatible with the backend project
- Node.js and npm

## 6. How to Run

### Start the backend

Open a terminal in the project root and run:

```bash
dotnet restore MeetingRoomBooking.sln
dotnet run --project MeetingRoomBooking.Api
```

The frontend is configured to communicate with the API at:

`http://localhost:5200`

If the API starts on a different port, update the frontend API configuration accordingly.

### Start the frontend

Open a second terminal and run:

```bash
cd meeting-room-booking-ui
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

`http://localhost:5173`

Run the backend and frontend simultaneously.

## 7. Configuration

Booking limits are configured in the backend's `appsettings.json`.

The current configuration includes:
- Maximum reservation duration: 7 days.
- Maximum booking horizon: 90 days.

These values can be changed in configuration rather than being hardcoded throughout the controller logic.

## 8. Data Storage

The application uses Entity Framework Core InMemory. This is suitable for a demonstration or coursework prototype because it does not require a separate database server.

**Important:** the data is not persistent. Reservations and other data stored in memory may be lost when the backend restarts.

## 9. Testing

The application was tested manually using PowerShell's `Invoke-RestMethod` to send HTTP requests to the backend API and verify endpoint responses and validation rules.

The backend was also built using `dotnet build` to verify that the project compiled successfully.

Automated backend unit tests have not been implemented.

## 10. Limitations

- Data is stored in memory and is not retained after a backend restart.
- The application is intended as a prototype rather than a production booking system.
- Authentication and authorization are not implemented.

## 11. Project Structure

```text
MeetingRoomBooking/
├── MeetingRoomBooking.Api/
│   ├── Controllers/
│   ├── Models/
│   ├── appsettings.json
│   └── Program.cs
├── meeting-room-booking-ui/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── index.html
└── MeetingRoomBooking.sln
```


# Taskflow — Full-stack Task Tracker

A small full-stack task management application built with **ASP.NET Core 8 Web API**, **Entity Framework Core**, **SQLite**, and a responsive HTML/CSS/JavaScript frontend.

## Features

- Dashboard summary cards for total, to-do, in-progress and completed tasks
- Board, list and calendar views
- Create, read, update and delete tasks
- Task category, priority, status and due date
- Search, category filtering and sorting
- SQLite persistence
- Swagger API documentation in Development mode
- Responsive layout for desktop and mobile

## Requirements

- .NET 8 SDK (or a newer SDK with the .NET 8 targeting pack)
- VS Code or Visual Studio (optional)

## Run the application

1. Extract the ZIP file.
2. Open the `TaskTrackerApi` folder in VS Code.
3. Open the terminal in that folder.
4. Run:

```powershell
dotnet restore
dotnet build
dotnet run
```

5. Open the dashboard at **http://localhost:5080**.
6. Open Swagger at **http://localhost:5080/swagger**.

Keep the terminal running while using the dashboard. Press `Ctrl + C` to stop the API.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/{id}` | Get one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

## Project structure

```text
TaskTrackerApi/
├── Controllers/
├── Data/
├── DTOs/
├── Models/
├── Properties/
├── Services/
├── wwwroot/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── Program.cs
├── appsettings.json
└── TaskTrackerApi.csproj
```

## Notes

- The frontend is served by the same ASP.NET Core application, so no separate frontend server or CORS configuration is needed.
- The SQLite database file (`tasktracker.db`) is created automatically on first run.
- The app stores task statuses and priorities as readable strings in JSON and SQLite.
- If you already have an older `tasktracker.db` created by an earlier version of this practice project, back it up and remove it before running this expanded version because `EnsureCreated()` does not alter an existing database schema.
- This is a learning/demo project. Add authentication, authorization, migrations, logging strategy and automated tests before using it in production.

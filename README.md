# Team Task Manager

Team Task Manager is a beginner-friendly full-stack project built with a FastAPI backend and a dark dashboard-style frontend.

The backend was built by **Suhaib** as a first backend project. It handles users, login, JWT authentication, teams, memberships, and task management. The frontend was added later with help from **Codex** to make the backend usable through a browser.

## Features

- Create a new user
- Login with JWT authentication
- Create a team
- Join an existing team by team ID
- Automatically open the first team a user belongs to
- Switch between teams
- Leave a team
- View team members
- Create tasks for team members
- View tasks assigned to the logged-in user
- Mark tasks as done or undo them
- Delete assigned tasks
- Dark responsive dashboard UI

## Tech Stack

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT authentication with `python-jose`
- Password hashing with `passlib`
- HTML, CSS, and JavaScript frontend

## Project Structure

```text
Team Task Manager API/
+-- TTM/
|   +-- main.py          # FastAPI app entry point
|   +-- models.py        # SQLAlchemy models and Pydantic schemas
|   +-- users.py         # User routes and login
|   +-- teams.py         # Team, membership, join, leave routes
|   +-- tasks.py         # Task CRUD and status routes
|   +-- auth.py          # Password hashing helpers
|   +-- jwt_handler.py   # JWT creation and current-user dependency
|   +-- database.py      # Database engine/session setup
|   +-- index.html       # Frontend page
|   +-- styles.css       # Frontend styles
|   +-- app.js           # Frontend logic
+-- requirements.txt
+-- .gitignore
+-- README.md
```

## How To Run

Open the project folder in VS Code.

Start the backend:

```powershell
TTM\Scripts\uvicorn.exe main:app --app-dir TTM --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```powershell
cd TTM
.\Scripts\python.exe -m http.server 5500 --bind 127.0.0.1
```

Open the app in your browser:

```text
http://127.0.0.1:5500
```

The backend runs at:

```text
http://127.0.0.1:8000
```

FastAPI docs are available at:

```text
http://127.0.0.1:8000/docs
```

## Basic App Flow

1. Open the frontend.
2. Create a user if you are new.
3. Login.
4. If you already belong to a team, the app opens your first team automatically.
5. If you do not belong to a team yet, create a team or join one by team ID.
6. Use the dashboard to manage members and assigned tasks.

## API Overview

Main routes include:

```text
POST   /users
GET    /users
GET    /me
POST   /login
PUT    /users

GET    /teams
POST   /teams
POST   /teams/{team_id}/join
DELETE /teams/{team_id}/leave
GET    /teams/{team_id}/members

GET    /tasks
POST   /tasks
PUT    /tasks/{task_id}
PUT    /tasks/{task_id}/status
DELETE /tasks/{task_id}
```

## Notes

- `app.db` is ignored by Git because it is a local SQLite database file.
- The virtual environment folders are ignored by Git.
- The JWT secret is currently hardcoded for learning purposes. In a production app, it should be moved to an environment variable.
- This project is mainly for learning backend fundamentals and connecting a backend to a real frontend.

## Credits

- Backend: Suhaib
- Frontend and README assistance: Codex

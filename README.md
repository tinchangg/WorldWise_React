# 🌏 WorldWise

A full-stack travel log application where users can document cities they’ve visited and visualize them on an interactive **Leaflet** map.

The project started as a React frontend app, guided by _Jonas Schmedtmann’s_ [The Ultimate React Course](https://www.udemy.com/course/the-ultimate-react-course/), and was later expanded into a **full-stack app** with a Node.js/Express backend and PostgreSQL database.

## ✨ Features

### Frontend (React + Leaflet)

- Landing page with app entry
- State management with **Context API** and **useReducer** for predictable updates
- Interactive map powered by **Leaflet** displaying visited cities
- Add and view city details:
  - city, country, country flag emoji
  - Date visited
  - Personal notes
  - Geographic coordinates with interactive Leaflet map

### Backend (Node.js + Express + PostgreSQL)

- REST API for CRUD operations on visited cities
- PostgreSQL database for persistent storage
- Express-based project structure for scalability

## 🗂️ Project Structure

```bash
.
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components + CSS modules
│   │   ├── context/     # Global state management
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Landing + App pages
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js   # Vite dev/proxy setup
│
└── server/              # Node.js backend
    ├── routes/          # Express routes
    ├── db.js            # PostgreSQL connection
    └── index.js         # Backend entry point
```

## 📍Roadmap

- [ ] API input validation & centralized error handling

- [ ] Authentication (JWT or sessions)

- [ ] User accounts & per-user city logs

- [ ] OAuth (Google login)

- [ ] Deployment (Render/Heroku or similar)

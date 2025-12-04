# 🌏 WorldWise

A full-stack travel log application where users can document cities they’ve visited and visualize them on an interactive **Leaflet** map.

The project started as a React frontend app, guided by _Jonas Schmedtmann’s_ [The Ultimate React Course](https://www.udemy.com/course/the-ultimate-react-course/), and was later expanded into a **full-stack app** with a Node.js/Express backend and PostgreSQL database.

> **[🔗Live Demo](https://worldwise-react-k23p.onrender.com/)**

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

## 🍽️ App Flow

1. Landing page introduces the travel tracker app
2. Log in or create an account
3. Select any city on the mapp to add a visited city
4. Browse your saved cities from the left side city list
5. Switch to the country tab to view all visited countries

## 🗂️ Project Structure

```bash
.
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components + CSS modules
│   │   ├── context/     # Global state management (Auth, Cities)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Landing and main app pages
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js   # Vite config + dev proxy
│
├── db/
│   └──migrations        # SQL migration file
│
└── server/              # Node.js backend
    ├── routes/          # Express routes
    ├── db.js            # PostgreSQL pool setup
    └── index.js         # Backend entry point
```

## 📍Roadmap

- [ ] API input validation & centralized error handling

- [x] Authentication (JWT or sessions)

- [x] User accounts & per-user city logs

- [ ] OAuth (Google login)

- [x] Deployment (Render/Heroku or similar)

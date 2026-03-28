# F1 Strategy Lab

A full-stack Formula 1 strategy and car configuration platform — built with React, Three.js, and a .NET API backend. Explore the 2026 race calendar, plan pit stop strategies, analyse corner data, compare team performance, and tune a 3D car model in real time.

---

## Features

### Race Calendar
Browse the full 2026 F1 season calendar. Each circuit card shows location, lap record, session schedule, track stats (DRS zones, tyre wear rating, overtaking difficulty), and a live SVG track map.

### Strategy Planner
Build and compare race strategies side by side. Choose from pre-built 1/2/3-stop templates or craft your own stint sequences with Soft, Medium, and Hard compounds. Visualise pit windows, lap time deltas, and live weather forecasts for each race location.

### Corners Analyser
Interactive track map overlay with labeled apex data, corner type, recommended racing line notes, and per-corner speed/braking stats for every circuit on the calendar.

### Team & Driver Comparison
Head-to-head radar chart comparison across performance dimensions — downforce, power, tyre management, straight-line speed, and more. Side-by-side spec table with constructor standings pulled from the Jolpica API.

### Car Builder (2D + 3D)
Configure front/rear wing angles, floor ride height, ICE output, ERS deployment rate, battery capacity, suspension stiffness, and weight distribution. Results feed into a live lap time simulation for the selected circuit.

- **2D mode** — animated airflow streamlines, pressure blobs, exhaust heat, and ERS glow overlaid on a top-down car graphic.
- **3D mode (Beta)** — fully sculpted React Three Fiber car model with real-time geometry that responds to slider changes. Orbit, zoom, and inspect every component.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| 3D Rendering | Three.js, React Three Fiber, Drei |
| State | Zustand + React Query |
| Charts | Recharts, D3 |
| Backend | ASP.NET Core (.NET 8) |
| Database | MongoDB |
| F1 Data | Jolpica API, OpenF1 API |
| Weather | Open-Meteo API |

---

## Project Structure

```
F1StrategyLab/
├── f1-strategy-lab/          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Calendar/     # Race calendar & circuit details
│   │   │   ├── Strategy/     # Pit stop strategy planner
│   │   │   ├── Corners/      # Track corner analysis
│   │   │   ├── Compare/      # Team comparison
│   │   │   └── Builder/      # Car builder & 3D visualiser
│   │   ├── store/            # Zustand global state
│   │   ├── api/              # API client functions
│   │   └── data/             # Static circuit & lap time data
│   └── public/               # Assets & SVG track maps
│
└── F1StrategyApi/            # .NET backend
    ├── Controllers/           # REST API endpoints
    ├── Services/              # Jolpica, OpenF1, Weather integrations
    └── Models/                # DTOs
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- MongoDB instance (local or Atlas)

### Frontend

```bash
cd f1-strategy-lab
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend

```bash
cd F1StrategyApi
dotnet restore
dotnet run
```

Runs at `http://localhost:5000`

Configure your API keys and MongoDB connection string in `appsettings.Development.json`:

```json
{
  "MongoDB": {
    "ConnectionString": "your-connection-string",
    "DatabaseName": "F1StrategyLab"
  }
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/calendar/races/{season}` | Full race calendar |
| GET | `/api/strategy/pitstops` | Historical pit stop data |
| GET | `/api/strategy/weather` | Race location weather forecast |
| GET | `/api/comparison/standings/{season}` | Constructor standings |
| GET | `/api/telemetry/car` | Live car telemetry |
| GET | `/api/telemetry/laps` | Lap time data |
| CRUD | `/api/setups/configs` | Saved car configurations |
| CRUD | `/api/setups/strategies` | Saved race strategies |

---

## License

MIT

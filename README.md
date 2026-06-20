# E-Ticket Booking Platform

A comprehensive, AI-powered e-ticket booking platform designed for Sri Lanka. This platform allows users to browse events, select seats interactively, purchase tickets securely, and manage their bookings. It features a modern frontend, a robust Node.js API, and a Python microservice for AI-driven capabilities such as personalized event recommendations and an intelligent chatbot assistant.

## ✨ Features

- **Event Discovery:** Browse and search for upcoming events by category, location, and date.
- **Interactive Seat Selection:** View real-time seat availability and select seats on an interactive map.
- **Secure Booking System:** Temporary seat locking during checkout to prevent double-booking.
- **QR Code Ticketing:** Generates unique QR codes for purchased tickets.
- **AI Event Assistant:** Integrated chatbot (powered by Qwen2.5-VL via Hugging Face) to answer user queries about events, pricing, and bookings.
- **AI Recommendations:** Personalized event recommendations based on user booking history, and similar event suggestions using NLP (TF-IDF & Cosine Similarity).
- **Automated Content Generation:** AI-generated professional event descriptions for organizers.
- **Dashboard:** Manage bookings, view purchased tickets, and access QR codes.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand, React Query
- **Routing:** React Router DOM
- **Other Tools:** Axios, QRCode.react, React Markdown

### Backend (Main API)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Cache / Concurrency:** Redis (ioredis) for seat locking mechanisms
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

### Backend (AI Microservice)
- **Language:** Python
- **Framework:** Flask
- **Database:** MongoDB (PyMongo)
- **Machine Learning:** scikit-learn (TF-IDF, Cosine Similarity)
- **AI Integration:** OpenAI SDK targeting Hugging Face inference endpoints (Qwen)

## 📁 Project Structure

```
eticket-platform/
├── frontend/             # React (Vite) frontend application
│   ├── src/              # React components, pages, and store
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── backend/              # Node.js Express API & Python Flask API
│   ├── src/              # Node.js API source code (controllers, routes, models)
│   ├── server.js         # Entry point for the Node.js API
│   ├── app.py            # Entry point for the Python AI Microservice
│   ├── package.json      # Node.js dependencies
│   └── requirements.txt  # Python dependencies
└── README.md             # This documentation file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- [Redis](https://redis.io/) (Local or Cloud URL)
- A Hugging Face account and Access Token (for AI features)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd eticket-platform
```

### 2. Setup the Node.js Backend (Main API)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the Node.js server:
   ```bash
   npm run dev
   ```

### 3. Setup the Python Backend (AI Microservice)

1. Stay in the `backend` directory (or open a new terminal in the `backend` directory).
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Update the `.env` file in the `backend` directory to include variables for Python:
   ```env
   HF_TOKEN=your_hugging_face_access_token
   ```
5. Start the Flask server:
   ```bash
   python app.py
   ```
   *The Python API will run on `http://localhost:5001` by default.*

### 4. Setup the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory (if needed) to specify your API URLs:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_AI_API_BASE_URL=http://localhost:5001
   ```
   *(Check the frontend codebase for exact environment variable names).*
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

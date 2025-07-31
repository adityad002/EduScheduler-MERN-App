# EduScheduler - Automatic Timetable Generator

EduScheduler is a full-stack MERN application designed to automate the complex process of academic scheduling for educational institutions. It uses a backtracking algorithm to generate conflict-free master timetables for all departments, semesters, and sections, ensuring no clashes for faculty or classrooms.

## Features

- **Role-Based Access Control:** Secure authentication for Admins, Faculty, and Students.
- **Dynamic Admin Dashboard:** A complete UI for managing courses, classrooms, faculty, and application settings (working days, time slots).
- **Automated Section Creation:** Define a course once and specify the number of sections to be created automatically.
- **Advanced Scheduling Algorithm:**
    - Handles weekly hour quotas and double-period lab sessions.
    - Randomizes resources to create balanced, realistic timetables.
- **Professional UI:** Built with Ant Design, featuring a collapsible sidebar, tables, modals, and a light/dark mode theme switcher.

## Tech Stack

- **Frontend:** React, Ant Design, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT (JSON Web Tokens)

## How to Run Locally

1.  **Clone the repository:**
    `git clone <your-repo-url>`
2.  **Setup Backend:**
    `cd server`
    `npm install`
    Create a `.env` file and add your `MONGO_URI` and `JWT_SECRET`.
    `node server.js`
3.  **Setup Frontend:**
    `cd client`
    `npm install`
    `npm start`

The application will be available at `http://localhost:3000`.

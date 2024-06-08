Tasker Documentation


Overview

Tasker is a MERN stack project designed to help users manage their tasks efficiently. It features user authentication, task management, and a responsive interface to handle various task states like pending, completed, and starred tasks.


Features

User Authentication: Utilizes Firebase for authentication.
Task Management: Allows users to create, read, update, and delete tasks.
Task States: Categorizes tasks as pending, completed, and starred.
Calendar View: Displays tasks in a calendar format.
Search Functionality: Enables users to search for tasks by title or notes.


Technology Stack

Frontend: React, Axios, Firebase, DayPilot Lite
Backend: Node.js, Express
Database: MongoDB
Hosting: Vercel for frontend and backend 


File Structure

Frontend
src: Contains all the React components and configurations.
components:
  taskform.js: Handles task creation and editing form.
  dashboard.js: Displays the dashboard view with task statistics.
  list.js: Displays and renders all the pages 
App.js: Main component that handles routing and displays different views based on the state.
dashboard.css: Styles for the dashboard.

Backend
index.js: Main server file handling API endpoints for tasks and connecting to MongoDB.

POST /tasks: Create a new task.
GET /tasks/
: Retrieve tasks for a specific user.
PATCH /tasks/
: Update a task's completion or starred status.
DELETE /tasks/
: Delete a specific task.


Usage

Clone the repository:
git clone https://github.com/IkanshGoyal/Tasker.git
cd Tasker

Install dependencies:
npm install


Setup environment variables:
Create a .env file in the root directory with the following:
MONGODB_URI=your_mongodb_connection_string
PORT=7070


Run the server:
npm start


Contributing

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -m 'Add new feature').
Push to the branch (git push origin feature-branch).
Open a Pull Request.

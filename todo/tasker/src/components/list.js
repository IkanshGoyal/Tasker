import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import "./dashboard.css";
import axios from 'axios';
import { DayPilot, DayPilotMonth } from "@daypilot/daypilot-lite-react";
import { FaStar, FaRegStar, FaCheckCircle, FaTrash, FaEdit } from 'react-icons/fa';
import TaskForm from "./taskform";

function List() {
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");
    const [title, setTitle] = useState("Dashboard");
    const [tasks, setTasks] = useState([]);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const navigate = useNavigate();

    const fetchUserName = async () => {
        try {
            const q = query(collection(db, "users"), where("uid", "==", user?.uid));
            const doc = await getDocs(q);
            const data = doc.docs[0].data();
            setName(data.name);
        } catch (err) {
            console.error(err);
            alert("An error occurred while fetching user data");
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`https://tasker-ecru-ten.vercel.app/tasks/${user?.uid}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`https://tasker-ecru-ten.vercel.app/tasks/${taskId}`);
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = (task) => {
        setTaskToEdit(task);
        setTitle("Edit Task");
    };

    const handleTaskSubmission = () => {
        setTitle("All Tasks");
        setTaskToEdit(null);
        fetchTasks();
    };

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
        fetchUserName();
        fetchTasks();
    }, [user, loading]);

    const renderContent = () => {
        switch (title) {
            case "Dashboard":
                return <Dashboard tasks={tasks} />;
            case "All Tasks":
                return <AllTasks tasks={tasks} fetchTasks={fetchTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />;
            case "Completed Tasks":
                return <CompletedTasks tasks={tasks} />;
            case "Pending Tasks":
                return <PendingTasks tasks={tasks} />;
            case "Starred Tasks":
                return <StarredTasks tasks={tasks} />;
            case "Calendar":
                return <Calendar tasks={tasks} />;
            case "Add new Task":
            case "Edit Task":
                return <TaskForm fetchTasks={fetchTasks} userId={user?.uid} taskToEdit={taskToEdit} onTaskSubmit={handleTaskSubmission} />;
            default:
                return <Dashboard tasks={tasks} />;
        }
    };

    return (
        <div className="todo">
            <div className="Navbar">
                <h3>TASKER</h3>
                <h3>{title}</h3>
                <div className="User">
                    <h5>Welcome, {name}</h5>
                    <button className="logout" onClick={logout}>Logout</button>
                </div>
            </div>
            <div className="Menu">
                <input className="searchbtn" type="text" placeholder="Search Tasks" />
                <button onClick={() => setTitle("Search")}>Search</button>
                <button onClick={() => setTitle("Dashboard")}>Dashboard</button>
                <button onClick={() => setTitle("All Tasks")}>All Tasks</button>
                <button onClick={() => setTitle("Completed Tasks")}>Completed Tasks</button>
                <button onClick={() => setTitle("Pending Tasks")}>Pending Tasks</button>
                <button onClick={() => setTitle("Starred Tasks")}>Starred Tasks</button>
                <button onClick={() => setTitle("Calendar")}>Calendar</button>
                <button onClick={() => setTitle("Add new Task")}>Add new Task</button>
            </div>
            <div className="Info">
                {renderContent()}
            </div>
        </div>
    );
}

function Dashboard({ tasks }) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const pendingTasks = tasks.filter(task => !task.isCompleted).length;
    const starredTasks = tasks.filter(task => task.isStarred).length;

    return (
        <div className="details">
            <p>Total Tasks: {totalTasks}</p>
            <p>Completed Tasks: {completedTasks}</p>
            <p>Pending Tasks: {pendingTasks}</p>
            <p>Starred Tasks: {starredTasks}</p>
        </div>
    );
}

function AllTasks({ tasks, fetchTasks, onEditTask, onDeleteTask }) {
    const handleCompleteTask = async (taskId) => {
        try {
            await axios.patch(`https://tasker-ecru-ten.vercel.app/tasks/${taskId}`, { isCompleted: true });
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error('Error marking task as complete:', error);
        }
    };

    const toggleStarredTask = async (taskId, isStarred) => {
        try {
            await axios.patch(`https://tasker-ecru-ten.vercel.app/tasks/${taskId}`, { isStarred: !isStarred });
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error('Error toggling starred status:', error);
        }
    };

    return (
        <div className="task-container">
            {tasks.map((task) => (
                <div key={task._id} className="task-card">
                    <div className="task-details">
                        <h3 className="task-header">{task.title}</h3>
                        <p><strong>Notes:</strong> {task.notes}</p>
                        <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {task.isCompleted ? "Completed" : "Pending"}</p>
                        {task.links && task.links.length > 0 && (
                            <div className="task-links">
                                <strong>Links:</strong>
                                <ul>
                                    {task.links.map((link, index) => (
                                        <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {task.image && <img src={task.image} alt={task.title} className="task-image" />}
                        {!task.isCompleted && (
                            <button className="complete-btn complete" onClick={() => handleCompleteTask(task._id)}>
                                <FaCheckCircle /> Mark as Complete
                            </button>
                        )}
                        <button className="star-btn star" onClick={() => toggleStarredTask(task._id, task.isStarred)}>
                            {task.isStarred ? <FaStar /> : <FaRegStar />}
                        </button>
                        <button className="edit-btn" onClick={() => onEditTask(task)}>
                            <FaEdit /> Edit
                        </button>
                        <button className="delete-btn" onClick={() => onDeleteTask(task._id)}>
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CompletedTasks({ tasks }) {
    return (
        <div className="task-container">
            {tasks.filter(task => task.isCompleted).map((task) => (
                <div key={task._id} className="task-card">
                    <div className="task-details">
                        <h3 className="task-header">{task.title}</h3>
                        <p><strong>Notes:</strong> {task.notes}</p>
                        <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {task.isCompleted ? "Completed" : "Pending"}</p>
                        {task.links && task.links.length > 0 && (
                            <div className="task-links">
                                <strong>Links:</strong>
                                <ul>
                                    {task.links.map((link, index) => (
                                        <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {task.image && <img src={task.image} alt={task.title} className="task-image" />}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PendingTasks({ tasks }) {
    return (
        <div className="task-container">
            {tasks.filter(task => !task.isCompleted).map((task) => (
                <div key={task._id} className="task-card">
                    <div className="task-details">
                        <h3 className="task-header">{task.title}</h3>
                        <p><strong>Notes:</strong> {task.notes}</p>
                        <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {task.isCompleted ? "Completed" : "Pending"}</p>
                        {task.links && task.links.length > 0 && (
                            <div className="task-links">
                                <strong>Links:</strong>
                                <ul>
                                    {task.links.map((link, index) => (
                                        <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {task.image && <img src={task.image} alt={task.title} className="task-image" />}
                    </div>
                </div>
            ))}
        </div>
    );
}

function StarredTasks({ tasks }) {
    return (
        <div className="task-container">
            {tasks.filter(task => task.isStarred).map((task) => (
                <div key={task._id} className="task-card">
                <div className="task-details">
                    <h3 className="task-header">{task.title}</h3>
                    <p><strong>Notes:</strong> {task.notes}</p>
                    <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {task.isCompleted ? "Completed" : "Pending"}</p>
                    {task.links && task.links.length > 0 && (
                        <div className="task-links">
                            <strong>Links:</strong>
                            <ul>
                                {task.links.map((link, index) => (
                                    <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {task.image && <img src={task.image} alt={task.title} className="task-image" />}
                </div>
            </div>
            ))}
        </div>
    );
}

function Calendar({ tasks }) {
    const events = tasks.map(task => ({
        id: task._id,
        text: task.title,
        start: task.deadline,
        end: task.deadline,
    }));

    return (
        <div className="calender">
            <DayPilotMonth
                startDate={DayPilot.Date.today()}
                events={events}
            />
        </div>
    );
}

export default List;

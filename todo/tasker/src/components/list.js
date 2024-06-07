import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import axios from 'axios';
import { DayPilot, DayPilotMonth } from "@daypilot/daypilot-lite-react";
import { FaStar, FaRegStar, FaCheckCircle, FaTrash, FaEdit } from 'react-icons/fa';
import TaskForm from "./taskform";
import "./dashboard.css";

function List() {
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");
    const [title, setTitle] = useState("Dashboard");
    const [tasks, setTasks] = useState([]);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

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
            fetchTasks();
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderContent = () => {
        switch (title) {
            case "Dashboard":
                return <Dashboard tasks={tasks} />;
            case "All Tasks":
                return <AllTasks tasks={filteredTasks} fetchTasks={fetchTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />;
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
            case "Search":
                return <AllTasks tasks={filteredTasks} fetchTasks={fetchTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />;
            default:
                return <Dashboard tasks={tasks} />;
        }
    };

    return (
        <div className="todo">
            <div className="Navbar">
                <h3>TASKER</h3>
                <h3 className="title">{title}</h3>
                <div className="User">
                    <h5>Welcome, {name}</h5>
                    <button className="logout" onClick={logout}>Logout</button>
                </div>
                <div className="Hamburger" onClick={toggleMenu}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </div>
            <div className={`Menu ${menuOpen ? 'open' : ''}`}>
                <input
                    className="searchbtn"
                    type="text"
                    placeholder="Search Tasks"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
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
    const upcomingTasks = tasks.filter(task => new Date(task.deadline) > new Date()).length;
    const overdueTasks = tasks.filter(task => new Date(task.deadline) < new Date() && !task.isCompleted).length;

    return (
        <div className="dashboard">
            <div className="dashboard-summary">
                <div className="summary-card">
                    <h4>Total Tasks</h4>
                    <p>{totalTasks}</p>
                </div>
                <div className="summary-card">
                    <h4>Completed Tasks</h4>
                    <p>{completedTasks}</p>
                </div>
                <div className="summary-card">
                    <h4>Pending Tasks</h4>
                    <p>{pendingTasks}</p>
                </div>
                <div className="summary-card">
                    <h4>Starred Tasks</h4>
                    <p>{starredTasks}</p>
                </div>
                <div className="summary-card">
                    <h4>Upcoming Tasks</h4>
                    <p>{upcomingTasks}</p>
                </div>
                <div className="summary-card">
                    <h4>Overdue Tasks</h4>
                    <p>{overdueTasks}</p>
                </div>
            </div>
        </div>
    );
}

function AllTasks({ tasks, fetchTasks, onEditTask, onDeleteTask }) {
    const handleCompleteTask = async (taskId) => {
        try {
            await axios.patch(`https://tasker-ecru-ten.vercel.app/tasks/${taskId}`, { isCompleted: true });
            fetchTasks();
        } catch (error) {
            console.error('Error marking task as complete:', error);
        }
    };

    const toggleStarredTask = async (taskId, isStarred) => {
        try {
            await axios.patch(`https://tasker-ecru-ten.vercel.app/tasks/${taskId}`, { isStarred: !isStarred });
            fetchTasks();
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
                        {task.links && task.links.filter(link => link).length > 0 && (
                            <div>
                                <strong>Links:</strong>
                                <ul>
                                    {task.links.filter(link => link).map((link, index) => (
                                        <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="task-actions">
                        <button onClick={() => toggleStarredTask(task._id, task.isStarred)}>
                            {task.isStarred ? <FaStar /> : <FaRegStar />}
                        </button>
                        <button onClick={() => handleCompleteTask(task._id)}><FaCheckCircle /></button>
                        <button onClick={() => onEditTask(task)}><FaEdit /></button>
                        <button onClick={() => onDeleteTask(task._id)}><FaTrash /></button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CompletedTasks({ tasks }) {
    const completedTasks = tasks.filter(task => task.isCompleted);

    return (
        <div className="task-container">
            {completedTasks.map((task) => (
                <div key={task._id} className="task-card">
                    <div className="task-details">
                        <h3 className="task-header">{task.title}</h3>
                        <p><strong>Notes:</strong> {task.notes}</p>
                        <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {task.isCompleted ? "Completed" : "Pending"}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PendingTasks({ tasks }) {
    const pendingTasks = tasks.filter(task => !task.isCompleted);

    return (
        <div className="task-container">
            {pendingTasks.map((task) => (
                <div key={task._id} className="task-card">
                    <div className="task-details">
                        <h3 className="task-header">{task.title}</h3>
                        <p><strong>Notes:</strong> {task.notes}</p>
                        <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {task.isCompleted ? "Completed" : "Pending"}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StarredTasks({ tasks }) {
    const starredTasks = tasks.filter(task => task.isStarred);

    return (
        <div className="task-container">
            {starredTasks.map((task) => (
                <div key={task._id} className="task-card">
                    <div className="task-details">
                        <h3 className="task-header">{task.title}</h3>
                        <p><strong>Notes:</strong> {task.notes}</p>
                        <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {task.isCompleted ? "Completed" : "Pending"}</p>
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
        start: new Date(task.deadline).toISOString(),
        end: new Date(task.deadline).toISOString(),
    }));

    return (
        <div className="Cal">
            <DayPilotMonth
                startDate={DayPilot.Date.today()}
                events={events}
            />
        </div>
    );
}

export default List;

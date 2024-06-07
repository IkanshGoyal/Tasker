import React, { useState } from "react";
import axios from 'axios';

function TaskForm({ fetchTasks, userId }) {
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [deadline, setDeadline] = useState("");
    const [links, setLinks] = useState([""]);
    const [image, setImage] = useState("");

    const handleAddLink = () => {
        setLinks([...links, ""]);
    };

    const handleLinkChange = (index, event) => {
        const newLinks = [...links];
        newLinks[index] = event.target.value;
        setLinks(newLinks);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const newTask = { userId, title, notes, deadline, links, image, isCompleted: false, isStarred: false };

        try {
            await axios.post(`http://localhost:7070/tasks`, newTask);
            fetchTasks();
            setTitle("");
            setNotes("");
            setDeadline("");
            setLinks([""]);
            setImage("");
        } catch (error) {
            console.error('Error adding new task:', error);
        }
    };

    return (
        <div className="task-form">
            <h2>Add New Task</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Title:
                    <input type="text" placeholder="Enter Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                    Notes:
                    <textarea value={notes} placeholder="Add notes" onChange={(e) => setNotes(e.target.value)} required />
                </label>
                <label>
                    Deadline:
                    <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
                </label>
                <label>
                    Links:
                    {links.map((link, index) => (
                        <input
                            key={index}
                            type="text"
                            value={link}
                            onChange={(e) => handleLinkChange(index, e)}
                            placeholder="Add a link"
                        />
                    ))}
                    <button type="button" onClick={handleAddLink}>Add Another Link</button>
                </label>
                <label>
                    Image URL:
                    <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Enter image URL" />
                    {image && <img src={image} alt="Selected" className="task-image-preview" />}
                </label>
                <button type="submit">Add Task</button>
            </form>
        </div>
    );
}

export default TaskForm;

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import axios from 'axios';
import List from './list';

function Dashboard() {
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    const fetchUserName = async () => {
        try {
            const q = query(collection(db, "users"), where("uid", "==", user?.uid));
            const doc = await getDocs(q);
            const data = doc.docs[0].data();
            setName(data.name);
        } catch (err) {
            console.error(err);
            alert("An error occured while fetching user data");
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`https://tasker-ecru-ten.vercel.app:7070/tasks/${user?.email}?search=${search}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
        fetchUserName();
    }, [user, loading]);

    useEffect(() => {
        fetchTasks();
    }, [search]);

    return (
        <div className="dashboard">
            <List/>
        </div>
    );
}

export default Dashboard;

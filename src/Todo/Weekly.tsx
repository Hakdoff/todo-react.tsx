import { useNavigate, useParams } from 'react-router-dom';
import './Get.scss';
import { useEffect, useState } from "react";

interface Weekly {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    isCompleted: boolean;
}

function WeeklyList() {
    const [weeklys, setWeeklys] = useState<Weekly[]>([]);
    const [weekly, setWeekly] = useState<Weekly | null>(null);
    const initialItemsToShow = 6;
    const itemsIncrement = 6;
    const navigate = useNavigate();
    
    const today = new Date();
    const currentWeek = today.getMonth();
    const currentYear = today.getFullYear();

    const weeklyTasks = weeklys.filter(weeklys => {
        const weeklyDate = new Date(weeklys.createdAt);
        return (
            weeklyDate.getMonth() === currentWeek &&
            weeklyDate.getFullYear() === currentYear
        )
    }
    );
    const [displayedMonth, ] = useState(today)

    const [todayToShow, setTodayToShow] = useState(initialItemsToShow);

    useEffect(() => {
        fetchWeeklys();
    }, [displayedMonth]);

    const fetchWeeklys = async () => {
        try {
            const response = await fetch("https://localhost:7168/api/Weekly");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data: Weekly[] = await response.json();
            setWeeklys(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [newData, setNewData] = useState({
        title: "",
        description: "",
        isCompleted: false,
        note: "",
        createdAt: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    

    const handleAddWeekly = async (e: React.FormEvent) => {
        e.preventDefault();
        const weeklyWithCreatedAt = {
            ...newData,
            createdAt: displayedMonth,
        }; 
        try {
            const response = await fetch("https://localhost:7168/api/Weekly", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(weeklyWithCreatedAt),
            });

            if (!response.ok) {
                throw new Error("Failed to add weekly");
            }

            setNewData({ title: "", description: "", isCompleted: false, note: "", createdAt: "" });
            setAddModalOpen(false);
            fetchWeeklys();
        } catch (error) {
            console.error("Error adding weekly:", error);
        }
    };

    const { id } = useParams<{ id: string }>();
    const [, setSelectedWeeklyId] = useState<number | null>(null)

    useEffect(() => {
        if (id) {
            fetchWeekly();
        }
    }, [id]);

    const fetchWeekly = async () => {
        try {
            const response = await fetch(`https://localhost:7168/api/Weekly/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data: Weekly = await response.json();
            if (data.createdAt) {
                const deadlineDate = new Date(data.createdAt);
                const year = deadlineDate.getFullYear();
                const week = String(deadlineDate.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDate.getDate()).padStart(2, '0');
                data.createdAt = `${year}-${week}-${day}`; // Format to YYYY-MM-DD
            }
            setWeekly(data);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    };

    const handleUpdateWeekly = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (weekly) {
                const response = await fetch(`https://localhost:7168/api/Weekly/${weekly.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(weekly),
                });

                if (!response.ok) {
                    throw new Error("Failed to update todo");
                }

                setUpdateModalOpen(false);
                setWeekly(null);
                setSelectedWeeklyId(null);
                fetchWeeklys();
            }
        } catch (error) {
            console.error("Error updating todo:", error);
        }
    };

    const handleDeleteWeekly = async (id: number) => {
        setSelectedWeeklyId(id);
        if (window.confirm("Are you sure you want to delete this todo?")) {
            try {
                const response = await fetch(`https://localhost:7168/api/Weekly/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete weekly");
                }

                fetchWeeklys(); // Refresh the todo list after deleting
                navigate("/");
            } catch (error) {
                console.error("Error deleting weekly:", error);
            }
        }
    };

    const handleEditClick = async (id: number) => {
        setSelectedWeeklyId(id);
        try {
            const response = await fetch(`https://localhost:7168/api/Weekly/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data = await response.json();
            if (data.deadline) {
                const deadlineDate = new Date(data.deadline);
                const year = deadlineDate.getFullYear();
                const week = String(deadlineDate.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDate.getDate()).padStart(2, '0');
                data.deadline = `${year}-${week}-${day}`; // Format to YYYY-MM-DD
            }
            setWeekly(data)
            setUpdateModalOpen(true);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    }


    const handleToggleCompleted = async (id: number) => {
        const updatedWeekly = weeklys.find(weekly => weekly.id === id);
        if (updatedWeekly) {
            const updatedData = { ...updatedWeekly, isCompleted: !updatedWeekly.isCompleted };
            try {
                const response = await fetch(`https://localhost:7168/api/Weekly/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedData),
                });

                if (!response.ok) {
                    throw new Error("Failed to update completion status");
                }

                // Update local state
                setWeeklys(prevWeekly =>
                    prevWeekly.map(weekly =>
                        weekly.id === id ? updatedData : weekly
                    )
                );
            } catch (error) {
                console.error("Error updating completion status:", error);
            }
        }
    };

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const [viewTasks, setViewTask] = useState(false);

    const handleViewTask = async (id: number) => {
        setSelectedWeeklyId(id);
        try {
            const response = await fetch(`https://localhost:7168/api/Weekly/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data = await response.json();
            if (data.deadline) {
                data.deadline = formatDateForInput(data.deadline);
            }
            setWeekly(data)
            setViewTask(true);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    }

    return (
        <section className="weekly">
            {addModalOpen && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Add New Weekly Task</h5>
                            </div>
                            <div>
                                <form onSubmit={handleAddWeekly}>
                                    <div className='goals__add-container'>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">Task:</label>
                                            <input type="text" className="goals__input" name="title" placeholder="Task Title" value={newData.title} onChange={handleInputChange} required />
                                        </div>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">Description:</label>
                                            <input type="text" className="goals__input" name="description" placeholder="Description" value={newData.description} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn" >Add Task</button>
                                        <button type="button" className="btn" onClick={() => setAddModalOpen(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {addModalOpen && (
                <div
                    className="modal-backdrop fade show"
                    onClick={() => setAddModalOpen(false)}
                ></div>
            )}

            {updateModalOpen && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Edit Task</h5>
                            </div>
                            <div>
                                {weekly ? (
                                    <form onSubmit={handleUpdateWeekly}>
                                        <div className='goals__add-container'>
                                            <div className='goals__input-container'>
                                                <label className='goals__label' htmlFor="">Task:</label>
                                                <input
                                                    type="text"
                                                    className="goals__input"
                                                    name="title"
                                                    value={weekly.title}
                                                    onChange={(e) => setWeekly({ ...weekly, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className='goals__input-container'>
                                                <label className='goals__label' htmlFor="">Task:</label>
                                                <input
                                                    type="text"
                                                    className="goals__input"
                                                    name="description"
                                                    value={weekly.description}
                                                    onChange={(e) => setWeekly({ ...weekly, description: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="submit" className="btn" >Update Weekly</button>
                                            <button type="button" className="btn" onClick={() => {
                                                setUpdateModalOpen(false); setWeekly(null);
                                                setSelectedWeeklyId(null);
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {updateModalOpen && (
                <div
                    className="modal-backdrop fade show"
                    onClick={() => setUpdateModalOpen(false)}
                ></div>
            )}

            {viewTasks && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">View Task</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => {
                                    setViewTask(false);
                                }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div>
                                {weekly ? (
                                    <>
                                        <div className="view_container">
                                            <div>
                                                <div className='view_title'>Task Title:</div>
                                                <div className='view_data'>- {weekly.title}</div></div>
                                            <div>
                                                <div className='view_title'>Task Description:</div>
                                                <div className='view_data'>- {weekly.description}</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {viewTasks && (
                <div
                    className="modal-backdrop fade show"
                    onClick={() => setViewTask(false)}
                ></div>
            )}

            <div className="body__title-container">
                <div className='goals__title'>Weekly Tasks</div>
                <div className='goals__title'><i className="bi bi-plus-circle" onClick={() => setAddModalOpen(true)}></i></div>
            </div>
            <div className="row body__row">
                {weeklyTasks.length === 0 ? (
                    <div>No  tasks for today</div>
                ) : (
                    <>
                        {weeklyTasks.slice(0, todayToShow).map((weekly) => (
                            <div className='body__lists'>
                                <div className="body__list-container" key={weekly.id} >
                                    <div className='body__card__left' >
                                        <input
                                            type="checkbox"
                                            checked={weekly.isCompleted}
                                            onChange={() => handleToggleCompleted(weekly.id)}
                                            style={{ marginRight: "10px" }}
                                        />
                                        <div className="body__card" onClick={() => handleViewTask(weekly.id)} style={{ cursor: "pointer", textDecoration: weekly.isCompleted ? "line-through" : "none", }}>
                                            <div className="body__card__title">{weekly.title}</div>
                                            <div className="body__card__desc">
                                                {weekly.description === "" ? (
                                                    <div>---</div>
                                                ) : (
                                                    <div className="body__card__desc">
                                                        {weekly.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='body__card__right'>
                                        <div className="body__icons-container">
                                            <i className="bi bi-pencil" key={`edit-icon-${weekly.id}`} onClick={() => handleEditClick(weekly.id)}></i>
                                            <i className="bi bi-x-circle" key={`delete-icon-${weekly.id}`} onClick={() => handleDeleteWeekly(weekly.id)}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )
                }
                {todayToShow < weeklyTasks.length && (
                    <button onClick={() => setTodayToShow(prev => prev + itemsIncrement)}className='btn'>View More</button>
                )}
            </div>
        </section>
    );
}

export default WeeklyList;
import { useNavigate, useParams } from 'react-router-dom';
import './Get.scss';
import { useEffect, useState } from "react";

interface Monthly {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    isCompleted: boolean;
}

function MonthlyList() {
    const [monthlys, setMonthlys] = useState<Monthly[]>([]);
    const [monthly, setMonthly] = useState<Monthly | null>(null);
    const initialItemsToShow = 6;
    const itemsIncrement = 6;
    const navigate = useNavigate();

    const [todayToShow, setTodayToShow] = useState(initialItemsToShow);

    useEffect(() => {
        fetchMonthlys();
    }, []);

    const fetchMonthlys = async () => {
        try {
            const response = await fetch("https://localhost:7168/api/Monthly");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data: Monthly[] = await response.json();
            setMonthlys(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    today.setHours(0, 0, 0, 0);
    const getMonth = new Date();
    getMonth.setMonth(currentMonth - 1);

    const monthlyTasks = monthlys.filter(monthlys => {
        const monthlyDate = new Date(monthlys.createdAt);
        return (
            monthlyDate.getMonth() === currentMonth &&
            monthlyDate.getFullYear() === currentYear
        )
    }
    );

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [newData, setNewData] = useState({
        title: "",
        description: "",
        isCompleted: false,
        note: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const handleAddMonthly = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("https://localhost:7168/api/Monthly", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newData),
            });

            if (!response.ok) {
                throw new Error("Failed to add monthly");
            }

            setNewData({ title: "", description: "", isCompleted: false, note: "" });
            setAddModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding monthly:", error);
        }
    };

    const { id } = useParams<{ id: string }>();
    const [, setSelectedMonthlyId] = useState<number | null>(null)

    useEffect(() => {
        if (id) {
            fetchMonthly();
        }
    }, [id]);

    const fetchMonthly = async () => {
        try {
            const response = await fetch(`https://localhost:7168/api/Monthly/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data: Monthly = await response.json();
            if (data.createdAt) {
                const deadlineDate = new Date(data.createdAt);
                const year = deadlineDate.getFullYear();
                const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDate.getDate()).padStart(2, '0');
                data.createdAt = `${year}-${month}-${day}`; // Format to YYYY-MM-DD
            }
            setMonthly(data);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    };

    const handleUpdateMonthly = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (monthly) {
                const response = await fetch(`https://localhost:7168/api/Monthly/${monthly.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(monthly),
                });

                if (!response.ok) {
                    throw new Error("Failed to update todo");
                }

                setUpdateModalOpen(false);
                setMonthly(null);
                setSelectedMonthlyId(null);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error updating todo:", error);
        }
    };

    const handleDeleteMonthly = async (id: number) => {
        setSelectedMonthlyId(id);
        if (window.confirm("Are you sure you want to delete this todo?")) {
            try {
                const response = await fetch(`https://localhost:7168/api/Monthly/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete monthly");
                }

                fetchMonthlys(); // Refresh the todo list after deleting
                navigate("/");
            } catch (error) {
                console.error("Error deleting monthly:", error);
            }
        }
    };

    const handleEditClick = async (id: number) => {
        setSelectedMonthlyId(id);
        try {
            const response = await fetch(`https://localhost:7168/api/Monthly/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data = await response.json();
            if (data.deadline) {
                const deadlineDate = new Date(data.deadline);
                const year = deadlineDate.getFullYear();
                const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDate.getDate()).padStart(2, '0');
                data.deadline = `${year}-${month}-${day}`; // Format to YYYY-MM-DD
            }
            setMonthly(data)
            setUpdateModalOpen(true);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    }

    const handleToggleCompleted = async (id: number) => {
        const updatedMonthly = monthlys.find(monthly => monthly.id === id);
        if (updatedMonthly) {
            const updatedData = { ...updatedMonthly, isCompleted: !updatedMonthly.isCompleted };
            try {
                const response = await fetch(`https://localhost:7168/api/Monthly/${id}`, {
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
                setMonthlys(prevMonthly =>
                    prevMonthly.map(monthly =>
                        monthly.id === id ? updatedData : monthly
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
        setSelectedMonthlyId(id);
        try {
            const response = await fetch(`https://localhost:7168/api/Todo/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data = await response.json();
            if (data.deadline) {
                data.deadline = formatDateForInput(data.deadline);
            }
            setMonthly(data)
            setViewTask(true);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    }

    return (
        <section className="monthly">
            {addModalOpen && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Add New Monthly Task</h5>
                            </div>
                            <div>
                                <form onSubmit={handleAddMonthly}>
                                    <div className='goals__add-container'>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">Task:</label>
                                            <input type="text" className="goals__input" name="title" placeholder="Title" value={newData.title} onChange={handleInputChange} required />
                                        </div>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">Description:</label>
                                            <input type="text" className="goals__input" name="description" placeholder="Description" value={newData.description} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-primary" >Save changes</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
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
                                {monthly ? (
                                    <form onSubmit={handleUpdateMonthly}>
                                        <div className='goals__add-container'>
                                            <div className='goals__input-container'>
                                                <label className='goals__label' htmlFor="">Task:</label>
                                                <input
                                                    type="text"
                                                    className="goals__input"
                                                    name="Task Title"
                                                    value={monthly.title}
                                                    onChange={(e) => setMonthly({ ...monthly, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className='goals__input-container'>
                                                <label className='goals__label' htmlFor="">Description:</label>
                                                <input
                                                    type="text"
                                                    className="goals__input"
                                                    name="description"
                                                    value={monthly.description}
                                                    onChange={(e) => setMonthly({ ...monthly, description: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="submit" className="btn btn-primary">Update Task</button>
                                            <button type="button" className="btn btn-secondary" onClick={() => {
                                                setUpdateModalOpen(false); setMonthly(null);
                                                setSelectedMonthlyId(null);
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
                                {monthly ? (
                                    <>
                                        <div className="view_container">
                                            <div>
                                                <div className='view_title'>Task Title:</div>
                                                <div className='view_data'>- {monthly.title}</div></div>
                                            <div>
                                                <div className='view_title'>Task Description:</div>
                                                <div className='view_data'>- {monthly.description}</div>
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
                <div className='goals__title'>Monthly Tasks</div>
                <div className='goals__title'><i className="bi bi-plus-circle" onClick={() => setAddModalOpen(true)}></i></div>
            </div>
            <div className="row body__row">
                {monthlyTasks.length === 0 ? (
                    <div>No  tasks for today</div>
                ) : (
                    <>
                        {monthlyTasks.slice(0, todayToShow).map((monthly) => (
                            <div className='body__lists'>
                                <div className="body__list-container" key={monthly.id} >
                                    <div className='body__card__left' >
                                        <input
                                            type="checkbox"
                                            checked={monthly.isCompleted}
                                            onChange={() => handleToggleCompleted(monthly.id)}
                                            style={{ marginRight: "10px" }}
                                        />
                                        <div className="body__card" onClick={() => handleViewTask(monthly.id)} style={{ cursor: "pointer", textDecoration: monthly.isCompleted ? "line-through" : "none", }}>
                                            <div className="body__card__title">{monthly.title}</div>
                                            <div className="body__card__desc">
                                                {monthly.description === "" ? (
                                                    <div>---</div>
                                                ) : (
                                                    <div className="body__card__desc">
                                                        {monthly.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='body__card__right'>
                                        <div className="body__icons-container">
                                            <i className="bi bi-pencil" key={`edit-icon-${monthly.id}`} onClick={() => handleEditClick(monthly.id)}></i>
                                            <i className="bi bi-x-circle" key={`delete-icon-${monthly.id}`} onClick={() => handleDeleteMonthly(monthly.id)}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )
                }
                {todayToShow < monthlyTasks.length && (
                    <button onClick={() => setTodayToShow(prev => prev + itemsIncrement)}>View More</button>
                )}
            </div>
        </section>
    );
}

export default MonthlyList;
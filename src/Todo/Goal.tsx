import { useParams } from 'react-router-dom';
import './Get.scss';
import { useEffect, useState } from "react";

interface Goal {
    id: number;
    title: string;
    createdAt: string;
    isCompleted: boolean;
    isEditing?: boolean;
}

function GoalList() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [, setGoal] = useState<Goal | null>(null);
    const initialItemsToShow = 6;
    const itemsIncrement = 6;

    const [todayToShow, setTodayToShow] = useState(initialItemsToShow);
    const today = new Date();
    const [displayedMonth, ] = useState(today)

    useEffect(() => {
        fetchGoals();
    }, [displayedMonth]);

    const fetchGoals = async () => {
        try {
            const response = await fetch("https://localhost:7168/api/Goal");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data: Goal[] = await response.json();
            setGoals(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1)
    const startOfWeek = new Date(today);
    const endOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const monthlyGoals = goals.filter(goals => {
        const goalDate = new Date(goals.createdAt);
        return (
            goalDate.getMonth() === currentMonth &&
            goalDate.getFullYear() === currentYear
        )
    }
    );

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newGoalData, setnewGoalData] = useState({
        title: "",
        deadline: "",
        isCompleted: false,
        note: "",
        createdAt: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setnewGoalData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        const goalWithCreatedAt = {
            ...newGoalData,
            createdAt: displayedMonth,
        }; 
        try {
            const response = await fetch("https://localhost:7168/api/Goal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(goalWithCreatedAt),
            });

            if (!response.ok) {
                throw new Error("Failed to add goal");
            }

            setnewGoalData({ title: "", deadline: "", isCompleted: false, note: "", createdAt: "" });
            setAddModalOpen(false);
            fetchGoals();
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    const { id } = useParams<{ id: string }>();
    const [, setSelectedGoalId] = useState<number | null>(null)

    useEffect(() => {
        if (id) {
            fetchGoal();
        }
    }, [id]);

    const fetchGoal = async () => {
        try {
            const response = await fetch(`https://localhost:7168/api/Goal/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data: Goal = await response.json();
            if (data.createdAt) {
                const deadlineDate = new Date(data.createdAt);
                const year = deadlineDate.getFullYear();
                const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDate.getDate()).padStart(2, '0');
                data.createdAt = `${year}-${month}-${day}`; // Format to YYYY-MM-DD
            }
            setGoal(data);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    };

    const handleDeleteGoal = async (id: number) => {
        setSelectedGoalId(id);
        if (window.confirm("Are you sure you want to delete this todo?")) {
            try {
                const response = await fetch(`https://localhost:7168/api/Goal/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete goal");
                }

                fetchGoals();
                window.location.reload();
            } catch (error) {
                console.error("Error deleting goal:", error);
            }
        }
    };

    const handleEditClick = async (id: number) => {
        setGoals(prevGoals => prevGoals.map(goal =>
            goal.id === id ? { ...goal, isEditing: true } : goal
        ));
    };

    const handleEditTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>, id: number) => {
        const newTitle = e.target.value;
        setGoals(prevGoals =>
            prevGoals.map(goal =>
                goal.id === id ? { ...goal, title: newTitle } : goal
            )
        );
    };

    const handleSaveTitle = async (id: number) => {
        const goalToUpdate = goals.find(goal => goal.id === id);
        if (goalToUpdate) {
            try {
                const response = await fetch(`https://localhost:7168/api/Goal/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(goalToUpdate),
                });

                if (!response.ok) {
                    throw new Error("Failed to update goal");
                }

                setGoals(prevGoals =>
                    prevGoals.map(goal =>
                        goal.id === id ? { ...goal, isEditing: false } : goal
                    )
                );
            } catch (error) {
                console.error("Error updating goal:", error);
            }
        }
    };

    const cancelEditing = (id: number) => {
        setGoals(prevGoals =>
            prevGoals.map(goal =>
                goal.id === id ? { ...goal, isEditing: false } : goal
            )
        );
    }

    const handleToggleCompleted = async (id: number) => {
        const updatedGoal = goals.find(goal => goal.id === id);
        if (updatedGoal) {
            const updatedData = { ...updatedGoal, isCompleted: !updatedGoal.isCompleted };
            try {
                const response = await fetch(`https://localhost:7168/api/Goal/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedData),
                });

                if (!response.ok) {
                    throw new Error("Failed to update completion status");
                }

                setGoals(prevGoals =>
                    prevGoals.map(goal =>
                        goal.id === id ? updatedData : goal
                    )
                );
            } catch (error) {
                console.error("Error updating completion status:", error);
            }
        }
    };

    return (
        <section className="goal">
            {addModalOpen && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Add New Goal</h5>
                            </div>
                            <form onSubmit={handleAddGoal}>
                                <div className='goals__add-container'>
                                    <div className='goals__input-container'>
                                        <label className='goals__label' htmlFor="">Goal:</label>
                                        <input type="text" className="goals__input" name="title" placeholder="Goal Title" value={newGoalData.title} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="modal-footer ">
                                    <button type="submit" className="btn" >Add Goal</button>
                                    <button type="button" className="btn" onClick={() => setAddModalOpen(false)}>Cancel</button>
                                </div>
                            </form>
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
            <div className='goals'>
                <div className="goals__title-container">
                    <div className='goals__title'>Goals</div>
                    <div className='goals__title'><i className="bi bi-plus-circle" onClick={() => setAddModalOpen(true)}></i></div>
                </div>
                {monthlyGoals.length === 0 ? (
                    <div>No Goals yet</div>
                ) : (
                    <>
                        {
                            monthlyGoals.slice(0, todayToShow).map((goal) => (
                                <div className='goals__lists'>
                                    <div className="goals__list-container"
                                        key={`goal-${goal.id}`} >
                                        <input
                                            type="checkbox"
                                            checked={goal.isCompleted}
                                            onChange={() => handleToggleCompleted(goal.id)}
                                            style={{ marginRight: "10px" }}
                                        />
                                        {goal.isEditing ? (
                                            <>
                                                <textarea name="title"
                                                    className="goals__input"
                                                    value={goal.title}
                                                    onChange={(e) => handleEditTitleChange(e, goal.id)}
                                                    // onBlur={() => handleSaveTitle(goal.id)} Save on blur or use a button
                                                    autoFocus
                                                />
                                                <i className="bi bi-check-circle" onClick={() => handleSaveTitle(goal.id)}></i>
                                                <i className="bi bi-x-circle" onClick={() => cancelEditing(goal.id)}></i>
                                            </>

                                        ) : (
                                            <>
                                                <div className='goals__list-title-container'
                                                    style={{
                                                        cursor: "pointer",
                                                        textDecoration: goal.isCompleted ? "line-through" : "none",
                                                    }}>
                                                    {goal.title}
                                                </div>
                                                <div className="goals__icons-container">
                                                    <i className="bi bi-pencil" key={`edit-icon-${goal.id}`} onClick={() => handleEditClick(goal.id)}></i>
                                                    <i className="bi bi-x-circle" key={`delete-icon-${goal.id}`} onClick={() => handleDeleteGoal(goal.id)}></i>
                                                </div>
                                            </>
                                        )}

                                    </div>
                                </div>
                            ))
                        }
                    </>
                )
                }
                {todayToShow < monthlyGoals.length && (
                    <button onClick={() => setTodayToShow(prev => prev + itemsIncrement)} className='btn'>View More</button>
                )}
            </div>
        </section>
    );
}

export default GoalList;
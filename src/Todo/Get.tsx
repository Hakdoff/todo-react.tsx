import { useParams } from "react-router-dom";
// import Todo from "./todo";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import GoalList from "./Goal";
import NoteList from "./Note";
import MonthlyList from "./Monthly";
import WeeklyList from "./Weekly";
import TodoList from "./Daily";

interface Todo {
    id: number;
    title: string;
    description: string;
    deadline: string;
    isCompleted: boolean;
}

interface Goal {
    id: number;
    title: string;
    createdAt: string;
    isCompleted: boolean;
    isGoalEditing?: boolean;
}

interface Note {
    id: number;
    description: string;
    createdAt: string;
    isEditing?: boolean;
}
function Planner() {
    const [date, setDate] = useState<Date | null>(null);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [todo, setTodo] = useState<Todo | null>(null);
    const today = new Date();
    const [displayedMonth, setDisplayedMonth] = useState(today)
    const [selectedMonthTodos, setSelectedMonthTodos] = useState<Todo[]>([]);


    const getMonthName = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
    };

    const currentMonthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(today);
    console.log(currentMonthName)

    const prevMonth = () => {
        setDisplayedMonth((prevDate) => {
            const prevMonth = new Date(prevDate);
            prevMonth.setMonth(prevDate.getMonth() - 1);
            return prevMonth;
        })
    }

    const nextMonth = () => {
        setDisplayedMonth((prevDate) => {
            const nextMonth = new Date(prevDate);
            nextMonth.setMonth(prevDate.getMonth() + 1);
            return nextMonth;
        })
    }

    // ------------------------------------------- Daily Tasks -------------------------------------------
    useEffect(() => {
        fetchTodos();
    }, [displayedMonth]);

    const fetchTodos = async () => {
        try {
            const response = await fetch("https://localhost:7168/api/Todo");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data: Todo[] = await response.json();

            const sortDate = data.sort((a, b) => {
                return Number(a.isCompleted) - Number(b.isCompleted)
            })
            const filteredTodos = data.filter((todo) => {
                const todoDate = new Date(todo.deadline);
                return (
                    todoDate.getMonth() === displayedMonth.getMonth() &&
                    todoDate.getFullYear() === displayedMonth.getFullYear()
                );
            });

            setTodos(sortDate);
            setSelectedMonthTodos(filteredTodos);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            fetchTodo();
        }
    }, [id]);


    const fetchTodo = async () => {
        try {
            const response = await fetch(`https://localhost:7168/api/Todo/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data: Todo = await response.json();
            if (data.deadline) {
                const deadlineDate = new Date(data.deadline);
                const year = deadlineDate.getFullYear();
                const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDate.getDate()).padStart(2, '0');
                data.deadline = `${year}-${month}-${day}`; // Format to YYYY-MM-DD
            }
            setTodo(data);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    };

    const [selectedDateTodos, setSelectedDateTodos] = useState<Todo[]>([]);
    const [showSelectedDateTodos, setShowSelectedDateTodos] = useState(false);

    const handleDateClick = (value: Date) => {
        setDate(value);
        const selectedTodos = todos.filter(todo => {
            const todoDate = new Date(todo.deadline);
            return todoDate.toDateString() === value.toDateString();
        }).map(todo => {
            const deadlineDate = new Date(todo.deadline);
            const formattedDeadline = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(deadlineDate);

            return {
                ...todo,
                formattedDeadline
            };
        });

        setSelectedDateTodos(selectedTodos);
        setShowSelectedDateTodos(true);
    };

    const [, setSelectedTodoId] = useState<number | null>(null);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleEditClick = async (id: number) => {
        setSelectedTodoId(id);
        try {
            const response = await fetch(`https://localhost:7168/api/Todo/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data = await response.json();
            if (data.deadline) {
                data.deadline = formatDateForInput(data.deadline);
            }
            setTodo(data)
            setUpdateModalOpen(true);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    }

    const handleDeleteTodo = async (id: number) => {
        setSelectedTodoId(id);
        if (window.confirm("Are you sure you want to delete this todo?")) {
            try {
                const response = await fetch(`https://localhost:7168/api/Todo/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete todo");
                }

                fetchTodos();
                window.location.reload();
            } catch (error) {
                console.error("Error deleting todo:", error);
            }
        }
    };

    const handleUpdateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (todo) {
                const response = await fetch(`https://localhost:7168/api/Todo/${todo.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(todo),
                });

                if (!response.ok) {
                    throw new Error("Failed to update todo");
                }

                setUpdateModalOpen(false);
                setTodo(null);
                setSelectedTodoId(null);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error updating todo:", error);
        }
    };

    const [viewTasks, setViewTask] = useState(false);

    const handleViewTask = async (id: number) => {
        setSelectedTodoId(id);
        try {
            const response = await fetch(`https://localhost:7168/api/Todo/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data = await response.json();
            if (data.deadline) {
                data.deadline = formatDateForInput(data.deadline);
            }
            setTodo(data)
            setViewTask(true);
        } catch (error) {
            console.error("Error fetching todo:", error);
        }
    }

    const handleToggleCompleted = async (id: number) => {
        const updatedTodo = todos.find(todo => todo.id === id);
        if (updatedTodo) {
            const updatedData = { ...updatedTodo, isCompleted: !updatedTodo.isCompleted };
            try {
                const response = await fetch(`https://localhost:7168/api/Todo/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedData),
                });

                if (!response.ok) {
                    throw new Error("Failed to update completion status");
                }

                setTodos(prevTodos =>
                    prevTodos.map(todo =>
                        todo.id === id ? updatedData : todo
                    )
                );

                // Update local state
                setSelectedDateTodos(prevTodo =>
                    prevTodo.map(todo =>
                        todo.id === id ? updatedData : todo
                    )
                );
            } catch (error) {
                console.error("Error updating completion status:", error);
            }
        }
    };

    // ------------------------------------------- Monthly Goals -------------------------------------------
    const [goals, setGoals] = useState<Goal[]>([]);
    const [, setGoal] = useState<Goal | null>(null);
    const [selectedMonthGoals, setSelectedMonthGoals] = useState<Goal[]>([]);
    const [addGoalModalOpen, setAddGoalModalOpen] = useState(false);
    const [, setSelectedGoalId] = useState<number | null>(null);
    const [newGoalData, setnewGoalData] = useState({
        title: "",
        deadline: "",
        isCompleted: false,
        note: "",
        createdAt: "",
    });

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


            const filteredGoals = data.filter((todo) => {
                const goalDate = new Date(todo.createdAt);
                return (
                    goalDate.getMonth() === displayedMonth.getMonth() &&
                    goalDate.getFullYear() === displayedMonth.getFullYear()
                );
            });
            const sortDate = filteredGoals.sort((a, b) => {
                return Number(a.isCompleted) - Number(b.isCompleted)
            })
            setSelectedMonthGoals(sortDate);
            setGoals(sortDate);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
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
            setAddGoalModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };


    const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setnewGoalData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

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

    const handleGoalEditClick = async (id: number) => {
        setSelectedMonthGoals(prevGoals => prevGoals.map(goal =>
            goal.id === id ? { ...goal, isGoalEditing: true } : goal
        ));
    };

    const handleEditTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>, id: number) => {
        const newTitle = e.target.value;
        setSelectedMonthGoals(prevGoals =>
            prevGoals.map(goal =>
                goal.id === id ? { ...goal, title: newTitle } : goal
            )
        );
    };

    const handleSaveTitle = async (id: number) => {
        const goalToUpdate = selectedMonthGoals.find(goal => goal.id === id);
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
                        goal.id === id ? { ...goal, ...goalToUpdate, isGoalEditing: false } : goal
                    )
                );

                setSelectedMonthGoals(prevGoals =>
                    prevGoals.map(goal =>
                        goal.id === id ? { ...goal, isGoalEditing: false } : goal
                    )
                );
            } catch (error) {
                console.error("Error updating goal:", error);
            }
        }
    };

    const cancelEditing = (id: number) => {
        setSelectedMonthGoals(prevGoals =>
            prevGoals.map(goal =>
                goal.id === id ? { ...goal, isGoalEditing: false } : goal
            )
        );
    }

    const handleGoalToggleCompleted = async (id: number) => {
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

                // Update local state
                setSelectedMonthGoals(prevGoals =>
                    prevGoals.map(goal =>
                        goal.id === id ? updatedData : goal
                    )
                );
            } catch (error) {
                console.error("Error updating completion status:", error);
            }
        }
    };



    // ------------------------------------------- Monthly Notes -------------------------------------------
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedMonthNotes, setSelectedMonthNotes] = useState<Note[]>([]);

    useEffect(() => {
        fetchNotes();
    }, [displayedMonth]);

    const fetchNotes = async () => {
        try {
            const response = await fetch("https://localhost:7168/api/Note");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data: Note[] = await response.json();

            const filteredNotes = data.filter((todo) => {
                const noteDate = new Date(todo.createdAt);
                return (
                    noteDate.getMonth() === displayedMonth.getMonth() &&
                    noteDate.getFullYear() === displayedMonth.getFullYear()
                );
            });
            setSelectedMonthNotes(filteredNotes);
            setNotes(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };




    return (
        <section className="todo">
            {updateModalOpen && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Edit Task</h5>
                            </div>
                            <div>
                                {todo ? (
                                    <form onSubmit={handleUpdateTodo}>
                                        <div className='goals__add-container'>
                                            <div className='goals__input-container'>
                                                <label className='goals__label' htmlFor="">Task:</label>
                                                <input
                                                    className="goals__input"
                                                    maxLength={60}
                                                    name="Title"
                                                    value={todo.title}
                                                    onChange={(e) => setTodo({ ...todo, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className='goals__input-container'>
                                                <label className='goals__label' htmlFor="">Description:</label>
                                                <input
                                                    className="goals__input"
                                                    name="Description"
                                                    value={todo.description}
                                                    onChange={(e) => setTodo({ ...todo, description: e.target.value })}
                                                />
                                            </div>
                                            <div className='goals__input-container'>
                                                <label className='goals__label' htmlFor="">Deadline:</label>
                                                <input type="datetime-local" className="goals__input" name="deadline" value={todo?.deadline || ""}
                                                    onChange={(e) => setTodo({ ...todo!, deadline: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="submit" className="btn btn-primary">Update Todo</button>
                                            <button type="button" className="btn btn-secondary" onClick={() => {
                                                setUpdateModalOpen(false); setTodo(null);
                                                setSelectedTodoId(null);
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
                                <h5 className="modal-title" id="exampleModalLongTitle">View Task Details</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => {
                                    setViewTask(false);
                                }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div>
                                {todo ? (
                                    <>
                                        <div className="view_container">
                                            <div>
                                                <label htmlFor="">Task Title</label>
                                                <div>{todo.title}</div></div>
                                            <div>
                                                <label htmlFor="">Task Description</label>
                                                <div>{todo.description}</div></div>
                                            <div>
                                                <label htmlFor="">Task Deadline</label>
                                                <div>{todo.deadline}</div></div>
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

            {/* ------------------------------------------------ Add Goal Modal ----------------------------------- */}

            {addGoalModalOpen && (
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
                                        <input type="text" className="goals__input" name="title" placeholder="Goal Title" value={newGoalData.title} onChange={handleGoalInputChange} required />
                                    </div>
                                </div>
                                <div className="modal-footer ">
                                    <button type="button" className="btn btn-secondary" onClick={() => setAddGoalModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" >Save changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {addGoalModalOpen && (
                <div
                    className="modal-backdrop fade show"
                    onClick={() => setAddGoalModalOpen(false)}
                ></div>
            )}

            <div className="header">
                <div className="appbar__tasks">
                    <div className="appbar__title">Erika's Planner</div>
                    <hr className="appbar__hr" />
                    <div className="appbar__sub-title">
                        <button onClick={prevMonth}>Previous Month</button>
                        {getMonthName(displayedMonth)}
                        <button onClick={nextMonth}>Next Month</button>
                    </div>
                </div>
            </div>
            <div className="body">
                <div className="body__goals">
                    {getMonthName(displayedMonth) === currentMonthName ? (
                        <GoalList />) : (
                        <>
                            <div className='goals'>
                                <div className="goals__title-container">
                                    <div className='goals__title'>Goals</div>
                                    <div className='goals__title'><i className="bi bi-plus-circle" onClick={() => setAddGoalModalOpen(true)}></i></div>
                                </div>
                                {selectedMonthGoals.length === 0 ? (
                                    <div>No Goals yet</div>
                                ) : (
                                    <>
                                        {
                                            selectedMonthGoals.map((goal) => (
                                                <div className='goals__lists'>
                                                    <div className="goals__list-container"
                                                        key={`goal-${goal.id}`} >
                                                        <input
                                                            type="checkbox"
                                                            checked={goal.isCompleted}
                                                            onChange={() => handleGoalToggleCompleted(goal.id)}
                                                            style={{ marginRight: "10px" }}
                                                        />
                                                        {goal.isGoalEditing ? (
                                                            <>
                                                                <textarea name="title"
                                                                    className="goals__input"
                                                                    value={goal.title}
                                                                    onChange={(e) => handleEditTitleChange(e, goal.id)}
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
                                                                    <i className="bi bi-pencil" key={`edit-icon-${goal.id}`} onClick={() => handleGoalEditClick(goal.id)}></i>
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
                            </div>
                        </>)}
                </div>
                <div className="body__todo goals">
                    {getMonthName(displayedMonth) === currentMonthName ? (
                        <>
                            {showSelectedDateTodos && date ? (
                                <div>
                                    <div className="body__title-container">
                                        <div className='goals__title'>Tasks for {date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</div>
                                        <div className='goals__title'>
                                            <i className="bi bi-x-circle" onClick={() => setShowSelectedDateTodos(false)}></i>
                                        </div>
                                    </div>
                                    <div className="row body__row">
                                        {selectedDateTodos.length === 0 ? (
                                            <div>No  tasks for today</div>
                                        ) : (
                                            <>
                                                {selectedDateTodos.map((todo) => (
                                                    <div className='body__lists'>
                                                        <div className="body__list-container" key={todo.id} >
                                                            <div className='body__card__left' >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={todo.isCompleted}
                                                                    onChange={() => handleToggleCompleted(todo.id)}
                                                                    style={{ marginRight: "10px" }}
                                                                />
                                                                <div className="body__card" onClick={() => handleViewTask(todo.id)} style={{ cursor: "pointer", textDecoration: todo.isCompleted ? "line-through" : "none", }}>
                                                                    <div className="body__card__title">
                                                                        {todo.title}
                                                                    </div>
                                                                    {todo.description === "" ? (
                                                                        <div>---</div>
                                                                    ) : (
                                                                        <div className="body__card__desc">
                                                                            {todo.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className='body__card__right'>
                                                                <div className="body__icons-container">
                                                                    <i className="bi bi-pencil" key={`edit-icon-${todo.id}`} onClick={() => handleEditClick(todo.id)}
                                                                        style={{ cursor: "pointer" }}></i>
                                                                    <i className="bi bi-x-circle" key={`delete-icon-${todo.id}`} onClick={() => handleDeleteTodo(todo.id)}
                                                                        style={{ cursor: "pointer" }}></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )
                                        }
                                    </div>
                                </div>
                            ) : <TodoList />}

                            <hr className="body__hr" />
                            <WeeklyList />
                            <hr className="body__hr" />
                            <MonthlyList /></>)
                        : (
                            <>
                                <hr className="body__hr" />
                                <div className="body__todo goals">
                                    <h2>Tasks for {getMonthName(displayedMonth)}</h2>

                                    {selectedMonthTodos.length === 0 ? (
                                        <p>No tasks for this month</p>
                                    ) : (
                                        selectedMonthTodos.map((todo) => (
                                            <div key={todo.id}>
                                                <h3>{todo.title}</h3>
                                                <p>{todo.description}</p>
                                                <small>{todo.deadline}</small>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                </div>
                <div className="body__calendar">
                    <div className="calendar-section">
                        <div className="goals">
                            <Calendar value={date} onChange={(value) => handleDateClick(value as Date)} />
                        </div>
                    </div>
                    <div className="">
                        {getMonthName(displayedMonth) === currentMonthName ? (
                            <NoteList />) : (<>
                                <hr className="body__hr" />
                                <div className="body__todo goals">
                                    <h2>Notes</h2>

                                    {selectedMonthNotes.length === 0 ? (
                                        <p>No tasks for this month</p>
                                    ) : (
                                        selectedMonthNotes.map((notes) => (
                                            <div key={notes.id}>
                                                <h6>{notes.description}</h6><br />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>)}
                    </div>
                </div>
            </div>
        </section >
    );
}

export default Planner;


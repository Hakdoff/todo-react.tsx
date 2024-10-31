import { useParams } from 'react-router-dom';
import './Get.scss';
import { useEffect, useState } from "react";

interface Todo {
    id: number;
    title: string;
    description: string;
    deadline: string;
    isCompleted: boolean;
}

function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [todo, setTodo] = useState<Todo | null>(null);
    const initialItemsToShow = 6;
    const itemsIncrement = 6;

    const [todayToShow, setTodayToShow] = useState(initialItemsToShow);

    useEffect(() => {
        fetchTodos();
    }, []);

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
            setTodos(sortDate);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const today = new Date();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [viewTasks, setViewTask] = useState(false);
    const [newData, setNewData] = useState({
        title: "",
        deadline: "",
        description: "",
        isCompleted: false,
    });

    const todayTodos = todos.filter(todo =>
        new Date(todo.deadline).toDateString() === today.toDateString()
    ).map(todo => {
        const deadlineDate = new Date(todo.deadline);
        const formattedDeadline = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(deadlineDate);
        return {
            ...todo,
            formattedDeadline
        };
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("https://localhost:7168/api/Todo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newData),
            });

            if (!response.ok) {
                throw new Error("Failed to add todo");
            }

            setNewData({ title: "", deadline: "", isCompleted: false, description: "" });
            setAddModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const { id } = useParams<{ id: string }>();
    const [, setSelectedTodoId] = useState<number | null>(null)

    useEffect(() => {
        if (id) {
            fetchTodo();
        }
    }, [id]);

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const fetchTodo = async () => {
        try {
            const response = await fetch(`https://localhost:7168/api/Todo/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }
            const data: Todo = await response.json();
            if (data.deadline) {
                data.deadline = formatDateForInput(data.deadline); // Format for input
            }

            setTodo(data);
        } catch (error) {
            console.error("Error fetching todo:", error);
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

                // Update local state
                setTodos(prevTodo =>
                    prevTodo.map(todo =>
                        todo.id === id ? updatedData : todo
                    )
                );
            } catch (error) {
                console.error("Error updating completion status:", error);
            }
        }
    };

    return (
        <section className="todo">
            {addModalOpen && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Add New Todo</h5>
                            </div>
                            <div>
                                <form onSubmit={handleAddTodo}>
                                    <div className='goals__add-container'>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">Task:</label>
                                            <input type="text" className="goals__input" maxLength={60} name="title" placeholder="Title" value={newData.title} onChange={handleInputChange} required />
                                        </div>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">Description:</label>
                                            <input type="text" className="goals__input" name="description" placeholder="Description" value={newData.description} onChange={handleInputChange} required />
                                        </div>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">
                                                Deadline:
                                            </label>
                                            <input type="datetime-local" className="goals__input" name="deadline" value={newData.deadline} onChange={handleInputChange} required />
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
                                <h5 className="modal-title" id="exampleModalLongTitle">View Task</h5>
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
                                                <div className='view_title'>Task Title:</div>
                                                <div className='view_data'>- {todo.title}</div></div>
                                            <div>
                                                <div className='view_title'>Task Description:</div>
                                                <div className='view_data'>- {todo.description}</div></div>
                                            <div>
                                                <div className='view_title'>Task Deadline:</div>
                                                <div className='view_data'>- {todo.deadline}</div></div>
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
                <div className='goals__title'>Today's Tasks</div>
                <div className='goals__title'><i className="bi bi-plus-circle" onClick={() => setAddModalOpen(true)}></i></div>
            </div>
            <div className="row body__row">
                {todayTodos.length === 0 ? (
                    <div>No  tasks for today</div>
                ) : (
                    <>
                        {todayTodos.slice(0, todayToShow).map((todo) => (
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
                {todayToShow < todayTodos.length && (
                    <button onClick={() => setTodayToShow(prev => prev + itemsIncrement)}>View More</button>
                )}
            </div>
        </section>
    );
}

export default TodoList;
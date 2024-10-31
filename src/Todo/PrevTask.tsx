// import { Add } from "@mui/icons-material";
// import { Fab } from "@mui/material";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Todo from "./todo";
// import './Get.scss';

// function PrevTasks({ todos }: { todos: Todo[] }) {
//     const navigate = useNavigate();
//     const initialItemsToShow = 3;
//     const itemsIncrement = 3;

//     const [itemsToShow, setItemsToShow] = useState(initialItemsToShow);

//     const handleTodoClick = (id: number) => {
//         navigate(`/todo/${id}`);
//     };

//     const handleAddClick = () => {
//         navigate("/add-todo");
//     };

//     const handleViewMore = () => {
//         setItemsToShow(prevCount => prevCount + itemsIncrement)
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date();
//     tomorrow.setDate(today.getDate() + 1)

//     const previousTodos = todos.filter(todo =>
//         new Date(todo.deadline) < today
//     )
//     return (
//         <section>
//             <div className="header">
//                 <div className="appbar__tasks">
//                     <div className="appbar__title">Erika</div>
//                     <hr className="appbar__hr"></hr>
//                     <div className="appbar__sub-title">Previous Task</div>
//                 </div>
//             </div>
//             <div className="body">
//             <div className="scrollable-section">
//                 {previousTodos.slice(0, itemsToShow).map((todo) => (
//                     <div className={`body__card ${todo.isCompleted ? "Completed" : "Not Completed"}`}
//                         key={todo.id}
//                         style={{
//                             textDecoration: todo.isCompleted ? "line-through" : "none",
//                         }}>
//                         <div className="body__card__title"
//                             key={todo.id}
//                             onClick={() => handleTodoClick(todo.id)}
//                             style={{ cursor: "pointer" }}
//                         >
//                             {todo.title}
//                         </div>
//                         <div>{todo.description}</div>
//                         <div>{todo.deadline}</div>
//                     </div>
//                 ))}
                
//                 {itemsToShow < previousTodos.length && (
//                     <button onClick={handleViewMore}>View More</button>
//                 )}</div>
//                 <div className="footer"  style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
//                     <div className="list">
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list-task" viewBox="0 0 16 16">
//                             <path fill-rule="evenodd" d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5zM3 3H2v1h1z" />
//                             <path d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z" />
//                             <path fill-rule="evenodd" d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5zM2 7h1v1H2zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm1 .5H2v1h1z" />
//                         </svg>
//                     </div>
//                     <div>
//                         <Fab className="" color="primary" aria-label="add" onClick={handleAddClick}>
//                             <Add></Add>
//                         </Fab>
//                     </div>
//                     <div className="previous">
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-archive-fill" viewBox="0 0 16 16">
//                             <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8z" />
//                         </svg>
//                     </div>
//                 </div>
                

//             </div>
//         </section>
//     );
// }

// export default PrevTasks

import { useEffect, useState } from "react";

interface Todo {
    id: number;
    title: string;
    description: string;
    deadline: string;
    isCompleted: boolean;
}

function ViewMonth() {
    const [selectedMonthTodos, setSelectedMonthTodos] = useState<Todo[]>([]);
    const today = new Date();
    const [displayedMonth, setDisplayedMonth] = useState(today);

    const getMonthName = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
    };

    

    const prevMonth = () => {
        setDisplayedMonth((prevDate) => {
            const prev = new Date(prevDate);
            prev.setMonth(prevDate.getMonth() - 1);
            return prev;
        });
    };

    const nextMonth = () => {
        setDisplayedMonth((prevDate) => {
            const next = new Date(prevDate);
            next.setMonth(prevDate.getMonth() + 1);
            return next;
        });
    };

    // Update todos when displayedMonth changes
    useEffect(() => {
        fetchTodos();
    }, [displayedMonth]);

    // Fetch todos and filter them for the displayed month
    const fetchTodos = async () => {
        try {
            const response = await fetch("https://localhost:7168/api/Todo");
            if (!response.ok) throw new Error("Network response was not ok");
            const data: Todo[] = await response.json();

            // Filter for the current displayed month and year
            const filteredTodos = data.filter((todo) => {
                const todoDate = new Date(todo.deadline);
                return (
                    todoDate.getMonth() === displayedMonth.getMonth() &&
                    todoDate.getFullYear() === displayedMonth.getFullYear()
                );
            });

            setSelectedMonthTodos(filteredTodos);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

    return (
        <section className="todo">
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
            </div>
        </section>
    );
}
export default ViewMonth;

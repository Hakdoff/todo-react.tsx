// import { useEffect, useState } from "react";
// import { useNavigate, useParams, } from "react-router-dom";

// interface Todo {
//     id: number;
//     title: string;
//     description: string;
//     deadline: string;
//     isCompleted: boolean;
//   }

// // TodoDetail Component
// function TodoDetail({ fetchTodos }: { fetchTodos: () => void }) {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const [todo, setTodo] = useState<Todo | null>(null);
  
//     useEffect(() => {
//       if (id) {
//         fetchTodo();
//       }
//     }, [id]);
  
//     const fetchTodo = async () => {
//       try {
//         const response = await fetch(`https://localhost:7168/api/Todo/${id}`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch todo");
//         }
//         const data: Todo = await response.json();
//         setTodo(data);
//       } catch (error) {
//         console.error("Error fetching todo:", error);
//       }
//     };
  
//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (todo) {
//         const { name, value } = e.target;
//         setTodo({
//           ...todo,
//           [name]: value,
//         });
//       }
//     };
  
//     const handleUpdateTodo = async (e: React.FormEvent) => {
//       e.preventDefault();
//       try {
//         if (todo) {
//           const response = await fetch(`https://localhost:7168/api/Todo/${todo.id}`, {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(todo),
//           });
  
//           if (!response.ok) {
//             throw new Error("Failed to update todo");
//           }
  
//           fetchTodos(); // Refresh the todo list after updating
//           navigate("/");
//         }
//       } catch (error) {
//         console.error("Error updating todo:", error);
//       }
//     };
  
//     const handleDeleteTodo = async () => {
//       if (todo && window.confirm("Are you sure you want to delete this todo?")) {
//         try {
//           const response = await fetch(`https://localhost:7168/api/Todo/${todo.id}`, {
//             method: "DELETE",
//           });
  
//           if (!response.ok) {
//             throw new Error("Failed to delete todo");
//           }
  
//           fetchTodos(); // Refresh the todo list after deleting
//           navigate("/");
//         } catch (error) {
//           console.error("Error deleting todo:", error);
//         }
//       }
//     };
  
//     return (
//       <div>
//         <h1>Edit Todo</h1>
//         {todo ? (
//           <form onSubmit={handleUpdateTodo}>
//             <input
//               type="text"
//               name="title"
//               value={todo.title}
//               onChange={handleInputChange}
//               required
//             />
//             <input
//               type="text"
//               name="description"
//               value={todo.description}
//               onChange={handleInputChange}
//               required
//             />
//             <input
//               type="date"
//               name="deadline"
//               value={todo.deadline}
//               onChange={handleInputChange}
//               required
//             />
//             <label>
//               Completed:
//               <input
//                 type="checkbox"
//                 name="isCompleted"
//                 checked={todo.isCompleted}
//                 onChange={(e) =>
//                   setTodo({
//                     ...todo,
//                     isCompleted: e.target.checked,
//                   })
//                 }
//               />
//             </label>
//             <button type="submit">Update Todo</button>
//             <button type="button" onClick={handleDeleteTodo}>
//               Delete Todo
//             </button>
//             <button type="button" onClick={() => navigate("/")}>
//               Cancel
//             </button>
//           </form>
//         ) : (
//           <p>Loading...</p>
//         )}
//       </div>
//     );
//   }
  
//   export default TodoDetail;
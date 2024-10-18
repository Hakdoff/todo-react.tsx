import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import AddTodo from './Todo/Create';

// Define the Todo interface
interface Todo {
  id: number;
  title: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

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
      setTodos(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoList todos={todos} />} />
        <Route path="/todo/:id" element={<TodoDetail fetchTodos={fetchTodos} />} />
        <Route path="/add-todo" element={<AddTodo fetchTodos={fetchTodos} />} />
      </Routes>
    </Router>
  );
}

// TodoList Component
function TodoList({ todos }: { todos: Todo[] }) {
  const navigate = useNavigate();

  const handleTodoClick = (id: number) => {
    navigate(`/todo/${id}`);
  };

  const handleAddClick = () => {
    navigate("/add-todo");
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <button onClick={handleAddClick}>Add New Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => handleTodoClick(todo.id)} style={{ cursor: "pointer" }}>
            <h2>{todo.title}</h2>
            <p>{todo.description}</p>
            <p>Deadline: {new Date(todo.deadline).toLocaleDateString()}</p>
            <p>Status: {todo.isCompleted ? "Completed" : "Not Completed"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// TodoDetail Component
function TodoDetail({ fetchTodos }: { fetchTodos: () => void }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [todo, setTodo] = useState<Todo | null>(null);

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
      setTodo(data);
    } catch (error) {
      console.error("Error fetching todo:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (todo) {
      const { name, value } = e.target;
      setTodo({
        ...todo,
        [name]: value,
      });
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

        fetchTodos(); // Refresh the todo list after updating
        navigate("/");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeleteTodo = async () => {
    if (todo && window.confirm("Are you sure you want to delete this todo?")) {
      try {
        const response = await fetch(`https://localhost:7168/api/Todo/${todo.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete todo");
        }

        fetchTodos(); // Refresh the todo list after deleting
        navigate("/");
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };

  return (
    <div>
      <h1>Edit Todo</h1>
      {todo ? (
        <form onSubmit={handleUpdateTodo}>
          <input
            type="text"
            name="title"
            value={todo.title}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="description"
            value={todo.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="deadline"
            value={todo.deadline}
            onChange={handleInputChange}
            required
          />
          <label>
            Completed:
            <input
              type="checkbox"
              name="isCompleted"
              checked={todo.isCompleted}
              onChange={(e) =>
                setTodo({
                  ...todo,
                  isCompleted: e.target.checked,
                })
              }
            />
          </label>
          <button type="submit">Update Todo</button>
          <button type="button" onClick={handleDeleteTodo}>
            Delete Todo
          </button>
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;

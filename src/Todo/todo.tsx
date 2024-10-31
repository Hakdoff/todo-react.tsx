// Todo.tsx
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import '../App.css';
import Planner from "./Get";
import PrevTasks from "./PrevTask";

interface Todo {
  id: number;
  title: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
  note: string;
}

function Todo() {
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
        <Route 
          path="/" 
          element={
            <Planner 
              todos={todos} 
              fetchTodos={fetchTodos}
            />
          } 
        />
        <Route path="/prev/todo/:id" element={<PrevTasks todos={todos} />} />
      </Routes>
    </Router>
  );
}

export default Todo;

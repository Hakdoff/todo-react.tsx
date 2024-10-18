import {  useState } from "react";
import { useNavigate } from "react-router-dom";

function AddTodo({ fetchTodos }: { fetchTodos: () => void }) {
    const [newData, setNewData] = useState({
      title: "",
      description: "",
      deadline: "",
      isCompleted: false,
    });
    const navigate = useNavigate();
  
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
  
        await response.json();
        fetchTodos(); // Refresh the todo list after adding a new one
        navigate("/");
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    };
  
    return (
      <div>
        <h1>Add New Todo</h1>
        <form onSubmit={handleAddTodo}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newData.title}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newData.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="deadline"
            value={newData.deadline}
            onChange={handleInputChange}
            required
          />
          <label>
            Completed:
            <input
              type="checkbox"
              name="isCompleted"
              checked={newData.isCompleted}
              onChange={(e) =>
                setNewData((prevData) => ({
                  ...prevData,
                  isCompleted: e.target.checked,
                }))
              }
            />
          </label>
          <button type="submit">Add Todo</button>
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </form>
      </div>
    );
}

export default AddTodo;

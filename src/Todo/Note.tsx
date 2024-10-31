import { useNavigate, useParams } from 'react-router-dom';
import './Get.scss';
import { useEffect, useState } from "react";

interface Note {
    id: number;
    description: string;
    createdAt: string;
    isEditing?: boolean;
}

function NoteList() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [note, setNote] = useState<Note | null>(null);
    const initialItemsToShow = 6;
    const itemsIncrement = 6;
    const navigate = useNavigate();

    const [todayToShow, setTodayToShow] = useState(initialItemsToShow);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await fetch("https://localhost:7168/api/Note");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data: Note[] = await response.json();
            setNotes(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1)
    const startOfWeek = new Date(today);
    const endOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const monthlyGoals = notes.filter(notes => {
        const goalDate = new Date(notes.createdAt);
        return (
            goalDate.getMonth() === currentMonth &&
            goalDate.getFullYear() === currentYear
        )
    }
    );

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newData, setNewData] = useState({
        description: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("https://localhost:7168/api/Note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newData),
            });

            if (!response.ok) {
                throw new Error("Failed to add note");
            }

            setNewData({ description: "" });
            setAddModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const { id } = useParams<{ id: string }>();
    const [, setSelectedNoteId] = useState<number | null>(null)

    useEffect(() => {
        if (id) {
            fetchNote();
        }
    }, [id]);

    const fetchNote = async () => {
        try {
            const response = await fetch(`https://localhost:7168/api/Note/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch note");
            }
            const data: Note = await response.json();
            if (data.createdAt) {
                const deadlineDate = new Date(data.createdAt);
                const year = deadlineDate.getFullYear();
                const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
                const day = String(deadlineDate.getDate()).padStart(2, '0');
                data.createdAt = `${year}-${month}-${day}`; // Format to YYYY-MM-DD
            }
            setNote(data);
        } catch (error) {
            console.error("Error fetching note:", error);
        }
    };

    const handleDeleteNote = async (id: number) => {
        setSelectedNoteId(id);
        if (window.confirm("Are you sure you want to delete this todo?")) {
            try {
                const response = await fetch(`https://localhost:7168/api/Note/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete note");
                }

                fetchNotes(); // Refresh the todo list after deleting
                navigate("/");
            } catch (error) {
                console.error("Error deleting note:", error);
            }
        }
    };

    const handleEditClick = async (id: number) => {
        setNotes(prevNotes => prevNotes.map(note =>
            note.id === id ? { ...note, isEditing: true } : note
        ));
    };

    const handleEditTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>, id: number) => {
        const newNote = e.target.value;
        setNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === id ? { ...note, description: newNote } : note
            )
        );
    };

    const handleSaveTitle = async (id: number) => {
        const goalToUpdate = notes.find(note => note.id === id);
        if (goalToUpdate) {
            try {
                const response = await fetch(`https://localhost:7168/api/Note/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(goalToUpdate),
                });

                if (!response.ok) {
                    throw new Error("Failed to update goal");
                }

                setNotes(prevNotes =>
                    prevNotes.map(note =>
                        note.id === id ? { ...note, isEditing: false } : note
                    )
                );
            } catch (error) {
                console.error("Error updating goal:", error);
            }
        }
    };

    const cancelEditing = (id: number) => {
        setNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === id ? { ...note, isEditing: false } : note
            )
        );
    }

    return (
        <section className="goal">
            {addModalOpen && (
                <div className="modal fade show" role="dialog" style={{ display: "block" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Add New Note</h5>
                            </div>
                            <div>
                                <form onSubmit={handleAddNote}>
                                    <div className='goals__add-container'>
                                        <div className='goals__input-container'>
                                            <label className='goals__label' htmlFor="">Goal:</label>
                                            <input type="text" name="description" className="goals__input" placeholder="description" value={newData.description} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" >Save changes</button>
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

            <div className='goals'>
                <div className="goals__title-container">
                    <div className='goals__title'>
                        Notes
                    </div>
                    <div className='goals__title'>
                        <i className="bi bi-plus-circle" onClick={() => setAddModalOpen(true)}></i>
                    </div>
                </div>
                {monthlyGoals.length === 0 ? (
                    <div>No Goals yet</div>
                ) : (
                    <>
                        {
                            monthlyGoals.slice(0, todayToShow).map((note) => (
                                <div className='goals__lists'>
                                    <div className="goals__list-container"
                                        key={note.id} >
                                        {note.isEditing ? (
                                            <>
                                                <textarea name="title"
                                                    className="goals__input"
                                                    value={note.description}
                                                    onChange={(e) => handleEditTitleChange(e, note.id)}
                                                    // onBlur={() => handleSaveTitle(goal.id)} Save on blur or use a button
                                                    autoFocus
                                                />
                                                <i className="bi bi-check-circle" onClick={() => handleSaveTitle(note.id)}></i>
                                                <i className="bi bi-x-circle" onClick={() => cancelEditing(note.id)}></i>
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    className='goals__list-title-container'
                                                    style={{
                                                        cursor: "pointer",
                                                    }}>

                                                    {note.description}
                                                </div>
                                                <div className="goals__icons-container">
                                                    <i className="bi bi-pencil" key={`edit-icon-${note.id}`} onClick={() => handleEditClick(note.id)}></i>
                                                    <i className="bi bi-x-circle" key={`delete-icon-${note.id}`} onClick={() => handleDeleteNote(note.id)}></i>
                                                </div>
                                            </>)}

                                    </div>
                                </div>
                            ))
                        }
                    </>
                )
                }
                {todayToShow < monthlyGoals.length && (
                    <button onClick={() => setTodayToShow(prev => prev + itemsIncrement)}>View More</button>
                )}
            </div>
        </section >
    );
}

export default NoteList;
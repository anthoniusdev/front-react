import React, { useState } from "react";
import styles from "./Card.module.scss";
import { Todo } from "../../types/Todo";
import { Star, Trash } from "lucide-react";
import ColorSelect from "../ColorSelect";
import { deleteTodo, updateTodo } from "../../lib/api";
import { toast } from "react-toastify";

interface CardProps extends Todo {
  handleFavorite: (id: number) => void;
  handleDelete: (id: number) => void;
}

const Card: React.FC<CardProps> = (props) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.title);
  const [description, setDescription] = useState<string>(props.description);
  const [isFavorite, setIsFavorite] = useState<boolean>(props.is_favorite);
  const [color, setColor] = useState<string>(props.color);

  const openEditMode = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setEditMode(true);
  };

  const closeEditMode = () => {
    setEditMode(false);
    setTitle(props.title);
    setDescription(props.description);
    setColor(props.color);
  };

  const handleSave = () => {
    handleEdit();
    setEditMode(false);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await updateTodo(props.id, { ...props, is_favorite: !isFavorite });
      if (!response.ok) {
        toast.error(response.message || "Failed to update todo");
        return;
      }
      setIsFavorite((prev) => !prev);
      props.handleFavorite(props.id);


    } catch (error) {
      toast.error("Failed to update todo: Connection to API failed");
    }
  };

  const toggleColor = (color: string) => {
    setColor(color);
  };

  const handleEdit = async () => {
    if (title === props.title && description === props.description && color === props.color && isFavorite === props.is_favorite) {
      toast.info("No changes made");
      return;
    }
    if (!title || !description) {
      toast.error("All fields are required");
      return;
    }
    const response = await updateTodo(props.id, {
      title,
      description,
      color,
      is_favorite: isFavorite,
    });
    console.log('response:', response);
    if (!response.ok) {
      toast.error(response.message || "Failed to update todo");
      return;
    }
    setTitle(response.data.title);
    setDescription(response.data.description);
    setColor(response.data.color);
    setIsFavorite(response.data.is_favorite);
    toast.success("To do updated successfully!");

  };

  const handleDelete = async () => {
    const response = await deleteTodo(props.id);
    console.log('response:', response);

    if (response.ok) {
      props.handleDelete(props.id);
      return;
    }
    toast.error("Failed to delete todo");
  };

  return (
    <div
      className={styles.Card}
      style={{ backgroundColor: color }}
      onClick={openEditMode}
    >
      <Star
        className={`${styles.star} ${isFavorite ? styles.starred : ''}`}
        size={20}
        onClick={handleFavorite}
      />
      <div className={styles.content}>
        {editMode ? (
          <>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={styles.inputTitle}
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={styles.inputDescription}
            />
          </>
        ) : (
          <>
            <h2>{title}</h2>
            <div className={styles.description}>{description}</div>
          </>
        )}
      </div>
      {editMode && (
        <div className={styles.buttonActions}>
          <ColorSelect onChange={toggleColor} />
          <button type="button" onClick={handleDelete}>
            <Trash size={16} />
          </button>

          <button type="button" onClick={closeEditMode}>Cancel</button>
          <button
            type="button"
            className={styles.btnSave}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      )}
    </div >
  );
};

export default Card;

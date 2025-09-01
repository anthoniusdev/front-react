import { useEffect, useRef, useState } from "react";
import { getTodos } from "../../lib/api";
import { Button, Card, NewCard, Search } from "../../components";
import styles from "./Todos.module.scss";
import { Todo } from "../../types/Todo";
import { toast, ToastContainer } from "react-toastify";

const TodosPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosFavorites, setTodosFavorites] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filteredTodosFavorites, setFilteredTodosFavorites] = useState<Todo[]>([]);
  const [search, setSearch] = useState<string>("");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const fetchTodos = async () => {
      try {
        const response = await getTodos();
        if (!response.ok) {
          toast.error(response.message || "Failed to fetch to dos");
          return;
        }
        if (response.data.length === 0) {
          toast.info(response.message || "No todos found");
        } else {
          const others = response.data.filter((todo: Todo) => !todo.is_favorite);
          const favorites = response.data.filter((todo: Todo) => todo.is_favorite);
          setTodos(others);
          setFilteredTodos(others);
          setTodosFavorites(favorites);
          setFilteredTodosFavorites(favorites);
          toast.success("To dos fetched successfully!");
        }
      } catch (e) {
        toast.error('Error fetching todos: Connection to API failed');
      }
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    const lowercasedQuery = search.toLowerCase();
    setFilteredTodos(todos.filter((todo) => todo.title.toLowerCase().includes(lowercasedQuery) || todo.description.toLowerCase().includes(lowercasedQuery)));
    setFilteredTodosFavorites(todosFavorites.filter((todo) => todo.title.toLowerCase().includes(lowercasedQuery) || todo.description.toLowerCase().includes(lowercasedQuery)));
  }, [search]);

  const handleFavorite = (id: number) => {
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex !== -1) {
      const todo = { ...todos[todoIndex], is_favorite: true };
      setTodos(todos.filter((t) => t.id !== id));
      setTodosFavorites([...todosFavorites, todo]);
      return;
    }
    const favIndex = todosFavorites.findIndex((todo) => todo.id === id);
    if (favIndex !== -1) {
      const todo = { ...todosFavorites[favIndex], is_favorite: false };
      setTodosFavorites(todosFavorites.filter((t) => t.id !== id));
      setTodos([...todos, todo]);
    }
  };

  const handleCreateTodo = (todo: Todo) => {
    toast.success('To do created successfully!');
    if (todo.is_favorite) {
      setFilteredTodosFavorites([...filteredTodosFavorites, todo]);
      return;
    }
    setFilteredTodos([...filteredTodos, todo]);
  };

  const handleDelete = (id: number) => {
    toast.success('To do deleted successfully!');
    if (todosFavorites.find((t) => t.id === id)) {
      setTodosFavorites(todosFavorites.filter((t) => t.id !== id));
      return;
    }
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.Todos}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h2>Core Notes</h2>
          <Search placeholder="Search notes..." value={search} setValue={setSearch} />
        </div>
        <NewCard createdTodo={handleCreateTodo} />
        {filteredTodosFavorites.length > 0 && (
          <>
            <p className={styles.subtitles}>Favorites</p>
            <div className={styles.cardsGrid}>
              {filteredTodosFavorites.map((todo) => (
                <Card
                  key={todo.id}
                  title={todo.title}
                  description={todo.description}
                  is_favorite={todo.is_favorite}
                  color={todo.color}
                  id={todo.id}
                  handleFavorite={handleFavorite}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
        {filteredTodos.length > 0 && (
          <>
            <p className={styles.subtitles}>Others</p>
            <div className={styles.cardsGrid}>
              {filteredTodos.map((todo) => (
                <Card
                  key={todo.id}
                  title={todo.title}
                  description={todo.description}
                  is_favorite={todo.is_favorite}
                  handleDelete={handleDelete}
                  handleFavorite={handleFavorite}
                  color={todo.color}
                  id={todo.id}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <ToastContainer />
    </div>
  );
};

export default TodosPage;

import cors from 'cors';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const todosFilePath = path.join(__dirname, './data/todos.json');

const app = express();
app.use(express.json());
app.use(cors());
const loadTodos = async () => {
  try {
    const content = await fs.readFile(todosFilePath, 'utf-8');
    if (content) {
      return JSON.parse(content);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(err);
      return {
        todos: [],
      };
    }
    throw err;
  }
};

const saveTodos = async (data) => {
  await fs.writeFile(todosFilePath, JSON.stringify(data, null, 2));
};

app.get('/', (req, res) => {
  res.send('hello TODO API');
});

app.get('/todos', async (req, res) => {
  const status = req.query.status;
  try {
    const data = await loadTodos();

    if (status) {
      switch (status) {
        case 'done':
          res.json(data.todos.filter((t) => t.isDone));
          return;
        case 'active':
          res.json(data.todos.filter((t) => !t.isDone));
          return;
        default:
          return res
            .status(400)
            .json({ message: 'Invalid status value. Use "done" or "active".' });
      }
    }
    res.json(data.todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load todos' });
  }
});

app.get('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await loadTodos();
    const todo = data.todos.find((t) => t.id === id);
    if (!todo) {
      res.status(404).json({ message: 'Todo with such id not found' });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error', reason: err.message });
  }
});

app.post('/todos', async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const data = await loadTodos();

    const newTodo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description?.trim() || '',
      isDone: false,
      createdAt: new Date().toISOString(),
    };

    data.todos.push(newTodo);
    await saveTodos(data);

    res.status(201).json({ message: 'Todo added', todo: newTodo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to save todo' });
  }
});

app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { isDone, title, description } = req.body;
  if (!title && !description && typeof isDone !== 'boolean') {
    return res.status(400).json({
      error:
        'At least one field (title, description, isDone) must be provided for update',
    });
  }
  try {
    const data = await loadTodos();
    const todo = data.todos.find((t) => t.id === id);
    if (!todo) {
      res.status(404).json({ message: 'Todo with such id not found' });
    }
    // Update only
    if (typeof isDone === 'boolean') todo.isDone = isDone;
    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description.trim();

    await saveTodos(data);

    res.json({ message: 'Todo updated', todo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const data = await loadTodos();
    const initialLength = data.todos.length;
    data.todos = data.todos.filter((t) => t.id !== req.params.id);

    if (data.todos.length === initialLength) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await saveTodos(data);
    res.status(204).end(); // 204 No Content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.listen(PORT, () => {
  console.log(`Server works ✔ on http://localhost:${PORT}`);
});

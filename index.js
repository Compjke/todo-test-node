import fs from 'fs/promises';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const todosFilePath = path.join(__dirname, './data/todos.json');

const loadData = async () => {
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

const saveData = async (data) => {
  fs.writeFile(todosFilePath, JSON.stringify(data, null, 2));
};
const server = createServer(async (req, res) => {
  const url = req.url;
  const method = req.method;
  const withParams = url.startsWith('/todos/');
  switch (true) {
    case url === '/' && method === 'GET':
      res.statusCode = 200;
      res.end(JSON.stringify({ message: 'Welcome to TODO App' }));
      return;
    case url === '/todos' && method === 'GET':
      try {
        const todos = await loadData();
        res.statusCode = 200;
        res.end(JSON.stringify(todos));
      } catch (err) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            error: 'Something went wrong when trying get todos',
          }),
        );
        return err;
      }
      return;
    case url === '/todos' && method === 'POST':
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const newTodoBody = JSON.parse(body);
          if (!newTodoBody.title.trim()) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Title is required' }));
          }
          const data = await loadData();

          const newTodo = {
            id: crypto.randomUUID(),
            title: newTodoBody.title || 'No title',
            description: newTodoBody.description || '',
            isDone: false,
            createdAt: new Date().toISOString(),
          };

          data.todos.push(newTodo);

          await saveData(data);
          res.statusCode = 201;
          res.end(JSON.stringify({ message: 'Todo added', todo: newTodo }));
        } catch (err) {
          console.log(err);
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON or missing title' }));
        }
      });

      return;
    case withParams && method === 'GET': {
      const id = url.split('/')[2];
      try {
        const data = await loadData();
        const todoById = data.todos.find((todo) => todo.id === id);
        if (!todoById) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Todo not found' }));
        }
        res.statusCode = 200;
        res.end(JSON.stringify(todoById));
        return;
      } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Failed to get todo by id' }));
        return;
      }
    }
    case withParams && method === 'DELETE': {
      const id = url.split('/')[2];
      try {
        const data = await loadData();
        const todoById = data.todos.find((todo) => todo.id === id);
        if (!todoById) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Todo not found' }));
        }
        const filteredTodos = data.todos.filter((todo) => todo.id !== id);
        await saveData({ todos: filteredTodos });
        res.statusCode = 204;
        res.end(JSON.stringify({ message: 'Todo deleted' }));
        return;
      } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end(
          JSON.stringify({ error: 'Failed delete todo', reason: err.message }),
        );
        return;
      }
    }
    default:
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
  }
});

server.listen(PORT, () => {
  console.log(`Server works ✔ on http://localhost:${PORT}`);
});

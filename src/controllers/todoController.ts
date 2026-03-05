import { toObjectId } from '@/utils/toMongoObjectId';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Todo as TodoModel } from '../models/Todo';
import { Todo } from './types';

export const getAllTodos = async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const showAll = req.query.all === 'true'; // ?all=true
  try {
    let query = {};
    if (!showAll) {
      query = { userId: req.user!.id };
    }

    let todos = await TodoModel.find(query).sort({ createdAt: -1 });

    if (status) {
      switch (status) {
        case 'done':
          todos = todos.filter((t) => t.isDone);
          break;
        case 'active':
          todos = todos.filter((t) => !t.isDone);
          break;
        default:
          return res.status(400).json({
            message: 'Invalid status value. Use "done" or "active".',
          });
      }
    }

    res.json(todos);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load todos' });
  }
};

export const getTodoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const todo = await TodoModel.findOne({ _id: id, userId: req.user?.id });

    if (!todo) {
      return res
        .status(404)
        .json({ message: 'Todo not found or access denied' });
    }

    res.json(todo);
  } catch (err: unknown) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const newTodo = new TodoModel({
      title: title.trim(),
      description: description?.trim() || '',
      isDone: false,
      createdAt: new Date(),
      userId: req.user!.id,
    });

    await newTodo.save();

    res.status(201).json({ message: 'Todo added', todo: newTodo });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save todo' });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isDone, title, description } = req.body as Partial<Todo>;
  if (!Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: 'Invalid todo id' });
  }
  if (
    
    title === undefined &&
    description === undefined &&
    typeof isDone !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'At least one field (title, description, isDone) must be provided',
    });
  }

  try {
    const todo = await TodoModel.findOneAndUpdate(
      // { _id: id, userId: new Types.ObjectId(req.user!.id) },
      {
        _id: id,
        userId: toObjectId(req.user!.id),
      },
      {
        ...(typeof isDone === 'boolean' && { isDone }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
      { new: true, runValidators: true },
    );

    if (!todo) {
      return res
        .status(404)
        .json({ message: 'Todo not found or access denied' });
    }

    res.json({ message: 'Todo updated', todo });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const result = await TodoModel.deleteOne({
      _id: req.params.id,
      userId: req.user!.id,
    });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: 'Todo not found or access denied' });
    }

    res.status(204).end();
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};

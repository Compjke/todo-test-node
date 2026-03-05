// src/models/Todo.ts
import { Document, Schema, Types, model } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description: string;
  isDone: boolean;
  createdAt: Date;
  userId: Types.ObjectId;
}

const todoSchema = new Schema<ITodo>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isDone: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Todo = model<ITodo>('Todo', todoSchema);

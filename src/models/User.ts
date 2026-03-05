import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  userName: string;
  password: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  userName: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = model('User', userSchema);

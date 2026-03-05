import { UserModel } from '@/models/User.js';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
export const register = async (req: Request, res: Response) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ error: 'Please provide information about user' });
  }
  const { userName, password } = req.body;
  if (!userName?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  try {
    const isUserAlreadyExists = await UserModel.findOne({
      userName: userName.trim(),
    });
    if (isUserAlreadyExists) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      userName: userName.trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: 'User was successfully created', userId: newUser._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res
      .status(400)
      .json({ error: 'Please provide credentials for login process' });
  }
  try {
    const user = await UserModel.findOne({
      userName,
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, userName: user.userName },
      JWT_SECRET,
      { expiresIn: '30m' },
    );
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

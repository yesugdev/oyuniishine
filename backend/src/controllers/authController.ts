import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../types';

const signToken = (user: IUser) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const safeRole = role === 'admin' ? 'parent' : role;
    const user = await User.create({ name, email, password, role: safeRole || 'parent' });
    return res.status(201).json({ token: signToken(user), user });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(401).json({ message: 'Account disabled' });
    return res.json({ token: signToken(user), user });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  return res.json(req.user);
};

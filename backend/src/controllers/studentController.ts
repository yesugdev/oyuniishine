import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student';
import { AuthRequest } from '../types';
import { uploadImage, deleteMedia } from '../services/cloudinary';
import fs from 'fs';

const isValidId = (id: string | string[]) => mongoose.Types.ObjectId.isValid(String(id));

// Fields that must never be overwritten via update body
const PROTECTED = new Set(['_id', '__v', 'teacher', 'createdAt', 'updatedAt', 'photos', 'reactions', 'viewCount']);

function sanitizeBody(body: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (!PROTECTED.has(key)) clean[key] = body[key];
  }
  return clean;
}

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { search, grade, class: cls, page = 1, limit = 12 } = req.query;
    const filter: Record<string, unknown> = { isPublic: true };
    if (grade) filter.grade = grade;
    if (cls) filter.class = cls;
    if (search) filter.$text = { $search: search as string };

    const skip = (Number(page) - 1) * Number(limit);
    const [students, total] = await Promise.all([
      Student.find(filter)
        .select('fullName nickname age grade class profilePhoto intro hobbies skills dreamProfession reactions viewCount photos')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Student.countDocuments(filter),
    ]);
    return res.json({ students, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const student = await Student.findById(req.params.id).populate('teacher', 'name avatar').lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.isPublic) {
      const user = req.user;
      if (!user) return res.status(401).json({ message: 'Not authorized' });
      const isTeacher = student.teacher && (student.teacher as any)._id?.toString() === user._id.toString();
      const isParent = student.parentUsers?.some((id) => id.toString() === user._id.toString());
      if (!isTeacher && !isParent && user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    await Student.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    return res.json(student);
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const data: Record<string, unknown> = { ...req.body, teacher: req.user!._id };
    if (req.file) {
      const result = await uploadImage(req.file.path, 'children-showcase/profiles');
      data.profilePhoto = result.secure_url;
      data.profilePhotoPublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    }
    const student = await Student.create(data);
    return res.status(201).json(student);
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isOwner = student.teacher.toString() === req.user!._id.toString();
    if (!isOwner && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const update = sanitizeBody(req.body);

    if (req.file) {
      if (student.profilePhotoPublicId) await deleteMedia(student.profilePhotoPublicId);
      const result = await uploadImage(req.file.path, 'children-showcase/profiles');
      update.profilePhoto = result.secure_url;
      update.profilePhotoPublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: false }
    );
    return res.json(updated);
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isOwner = student.teacher.toString() === req.user!._id.toString();
    if (!isOwner && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (student.profilePhotoPublicId) await deleteMedia(student.profilePhotoPublicId);
    await student.deleteOne();
    return res.json({ message: 'Student deleted' });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const uploadStudentPhoto = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Student not found' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const result = await uploadImage(req.file.path, 'children-showcase/gallery');
    fs.unlinkSync(req.file.path);

    const photo = { url: result.secure_url, publicId: result.public_id, caption: req.body.caption, uploadedAt: new Date() };
    student.photos.push(photo);
    await student.save();
    return res.status(201).json(photo);
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudentPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { id, photoId } = req.params;
    if (!isValidId(id)) return res.status(404).json({ message: 'Student not found' });
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const photo = student.photos.find((p) => (p as any)._id.toString() === photoId);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    if (photo.publicId) await deleteMedia(photo.publicId);
    student.photos = student.photos.filter((p) => (p as any)._id.toString() !== photoId);
    await student.save();
    return res.json({ message: 'Photo deleted' });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const reactToStudent = async (req: AuthRequest, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const { type } = req.body;
    const userId = req.user!._id;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existingIdx = student.reactions.findIndex((r) => r.userId.toString() === userId.toString());
    if (existingIdx >= 0) {
      if (student.reactions[existingIdx].type === type) {
        student.reactions.splice(existingIdx, 1);
      } else {
        student.reactions[existingIdx].type = type;
      }
    } else {
      student.reactions.push({ userId, type });
    }

    await student.save();
    return res.json({ reactions: student.reactions });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const addVideo = async (req: AuthRequest, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isOwner = student.teacher.toString() === req.user!._id.toString();
    if (!isOwner && req.user!.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { url, title } = req.body;
    if (!url) return res.status(400).json({ message: 'URL required' });

    const video = { url: url.trim(), title: title?.trim() || '' };
    student.videos.push(video);
    await student.save();
    return res.status(201).json(student.videos[student.videos.length - 1]);
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id, videoId } = req.params;
    if (!isValidId(id)) return res.status(404).json({ message: 'Student not found' });
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isOwner = student.teacher.toString() === req.user!._id.toString();
    if (!isOwner && req.user!.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    student.videos = student.videos.filter((v) => (v as any)._id.toString() !== videoId);
    await student.save();
    return res.json({ message: 'Video deleted' });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherStudents = async (req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find({ teacher: req.user!._id })
      .select('fullName nickname age grade class profilePhoto isPublic reactions viewCount createdAt')
      .sort({ createdAt: -1 })
      .lean();
    return res.json(students);
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

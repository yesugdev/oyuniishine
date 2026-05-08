import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
  deleteStudentPhoto,
  addVideo,
  deleteVideo,
  reactToStudent,
  getTeacherStudents,
} from '../controllers/studentController';
import { protect, optionalProtect, authorize } from '../middleware/auth';

const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
});

const router = Router();

router.get('/', getStudents);
router.get('/my', protect, authorize('teacher'), getTeacherStudents);
router.get('/:id', optionalProtect, getStudentById);

router.post('/', protect, authorize('teacher', 'admin'), upload.single('profilePhoto'), createStudent);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('profilePhoto'), updateStudent);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteStudent);

router.post('/:id/photos', protect, authorize('teacher', 'admin'), upload.single('photo'), uploadStudentPhoto);
router.delete('/:id/photos/:photoId', protect, authorize('teacher', 'admin'), deleteStudentPhoto);

router.post('/:id/videos', protect, authorize('teacher', 'admin'), addVideo);
router.delete('/:id/videos/:videoId', protect, authorize('teacher', 'admin'), deleteVideo);

router.post('/:id/react', protect, reactToStudent);

export default router;

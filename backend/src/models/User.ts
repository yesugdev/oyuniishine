import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'teacher' | 'parent';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  children?: mongoose.Types.ObjectId[];
  classes?: string[];
  isActive: boolean;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'teacher', 'parent'], default: 'parent' },
    avatar: String,
    phone: String,
    children: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    classes: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Mongoose v9: async pre hooks don't need `next`
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Use `transform` with `any` to avoid strict Mongoose v9 type mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model<IUser>('User', UserSchema);

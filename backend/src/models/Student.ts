import mongoose, { Document, Schema } from 'mongoose';

interface IPhoto {
  url: string;
  publicId: string;
  caption?: string;
  uploadedAt: Date;
}

interface IVideo {
  url: string;
  thumbnail?: string;
  title: string;
  publicId?: string;
}

interface IAchievement {
  title: string;
  date: Date;
  description?: string;
  type: 'award' | 'certificate' | 'sports' | 'art' | 'academic' | 'other';
  imageUrl?: string;
}

interface ITimelineEvent {
  date: Date;
  event: string;
  type: 'academic' | 'social' | 'personal' | 'achievement';
  emoji?: string;
}

interface IReaction {
  userId: mongoose.Types.ObjectId;
  type: 'heart' | 'star' | 'smile' | 'clap';
}

interface IGrade {
  subject: string;
  score: number;
  term: '1-р улирал' | '2-р улирал' | '3-р улирал' | '4-р улирал' | 'Жилийн эцэст';
  comment?: string;
  date: Date;
}

export interface IStudent extends Document {
  // Basic
  fullName: string;
  nickname?: string;
  age: number;
  grade: string;
  birthday: Date;
  profilePhoto?: string;
  profilePhotoPublicId?: string;
  intro?: string;
  isPublic: boolean;

  // Personality
  hobbies: string[];
  favoriteSubject?: string;
  favoriteActivity?: string;
  skills: string[];
  dreamProfession?: string;
  traits: string[];
  whatMakesSpecial?: string;

  // Emotional & Social
  bestMemory?: string;
  friendQuote?: string;
  teacherComment?: string;
  parentMessage?: string;
  childMessage?: string;

  // Media
  photos: IPhoto[];
  videos: IVideo[];

  // Achievements
  achievements: IAchievement[];
  timeline: ITimelineEvent[];

  // AI-generated
  aiSummary?: string;
  aiStrengths: string[];

  grades: IGrade[];

  // Relations
  teacher: mongoose.Types.ObjectId;
  parentUsers: mongoose.Types.ObjectId[];
  class: string;

  // Engagement
  reactions: IReaction[];
  viewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true, trim: true },
    nickname: String,
    age: { type: Number, required: true, min: 3, max: 18 },
    grade: { type: String, required: true },
    birthday: { type: Date, required: true },
    profilePhoto: String,
    profilePhotoPublicId: String,
    intro: String,
    isPublic: { type: Boolean, default: false },

    hobbies: [String],
    favoriteSubject: String,
    favoriteActivity: String,
    skills: [String],
    dreamProfession: String,
    traits: [String],
    whatMakesSpecial: String,

    bestMemory: String,
    friendQuote: String,
    teacherComment: String,
    parentMessage: String,
    childMessage: String,

    photos: [
      {
        url: { type: String, required: true },
        publicId: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        thumbnail: String,
        title: String,
        publicId: String,
      },
    ],

    achievements: [
      {
        title: { type: String, required: true },
        date: { type: Date, required: true },
        description: String,
        type: {
          type: String,
          enum: ['award', 'certificate', 'sports', 'art', 'academic', 'other'],
          default: 'other',
        },
        imageUrl: String,
      },
    ],

    timeline: [
      {
        date: { type: Date, required: true },
        event: { type: String, required: true },
        type: {
          type: String,
          enum: ['academic', 'social', 'personal', 'achievement'],
          default: 'personal',
        },
        emoji: String,
      },
    ],

    aiSummary: String,
    aiStrengths: [String],

    grades: [
      {
        subject:  { type: String, required: true, trim: true },
        score:    { type: Number, required: true, min: 0, max: 100 },
        term:     { type: String, required: true, enum: ['1-р улирал','2-р улирал','3-р улирал','4-р улирал','Жилийн эцэст'] },
        comment:  String,
        date:     { type: Date, default: Date.now },
      },
    ],

    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    class: { type: String, required: true },

    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['heart', 'star', 'smile', 'clap'] },
      },
    ],
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StudentSchema.index({ fullName: 'text', grade: 1, class: 1 });
StudentSchema.index({ isPublic: 1, teacher: 1 });

export default mongoose.model<IStudent>('Student', StudentSchema);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User';
import Student from '../models/Student';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');

  // Upsert teacher (давхардсан бол шинэчлэх)
  let teacher = await User.findOne({ email: 'teacher@demo.mn' });
  if (!teacher) {
    teacher = await User.create({
      name: 'Б.Отгонбаяр',
      email: 'teacher@demo.mn',
      password: 'demo1234',
      role: 'teacher',
      classes: ['4А', '5А'],
    });
    console.log('✓ Teacher created');
  } else {
    console.log('✓ Teacher already exists, skipping');
  }

  // Upsert parent
  let parent = await User.findOne({ email: 'parent@demo.mn' });
  if (!parent) {
    parent = await User.create({
      name: 'Д.Батбаяр',
      email: 'parent@demo.mn',
      password: 'demo1234',
      role: 'parent',
    });
    console.log('✓ Parent created');
  } else {
    console.log('✓ Parent already exists, skipping');
  }

  // Upsert student
  let student1 = await Student.findOne({ fullName: 'Энхбаяр Дорж', teacher: teacher._id });
  if (!student1) {
    student1 = await Student.create({
      fullName: 'Энхбаяр Дорж',
      nickname: 'Энхэ',
      age: 10,
      grade: '4',
      birthday: new Date('2016-03-15'),
      intro: 'Математик болон шатрын авьяастан. Ирээдүйн инженер.',
      isPublic: true,
      hobbies: ['Шатар', 'Математик', 'Футбол'],
      favoriteSubject: 'Математик',
      skills: ['Логик сэтгэлгээ', 'Дэвшилтэт математик'],
      dreamProfession: 'Инженер',
      traits: ['Тэвчээртэй', 'Ухаантай'],
      whatMakesSpecial: 'Шатраар бүсийн аварга болсон цорын ганц 4-р ангийн сурагч',
      teacherComment: 'Маш авьяастай, тэвчээртэй сурагч',
      parentMessage: 'Хүүе, чи бидний хамгийн том бахархал!',
      childMessage: 'Дэлхийн шатрын аварга болно!',
      achievements: [
        { title: 'Шатрын тэмцээн 1-р байр', date: new Date('2025-10-01'), type: 'award', description: 'Бүсийн шатрын тэмцээн' },
        { title: 'Математикийн олимпиад 3-р байр', date: new Date('2025-05-15'), type: 'academic' },
      ],
      timeline: [
        { date: new Date('2025-11-20'), event: 'Шатрын бүсийн тэмцээнд 1-р байр', type: 'achievement', emoji: '🏆' },
        { date: new Date('2025-09-01'), event: '4-р ангид шилжсэн', type: 'academic', emoji: '📚' },
      ],
      aiSummary: 'Энхбаяр бол онцгой логик сэтгэлгээтэй сурагч юм.',
      aiStrengths: ['Математик', 'Логик', 'Стратегик'],
      teacher: teacher._id,
      parentUsers: [parent._id],
      class: '4А',
      viewCount: 0,
    });
    console.log('✓ Student created');
  } else {
    console.log('✓ Student already exists, skipping');
  }

  // Link student to parent
  await User.findByIdAndUpdate(parent._id, { children: [student1._id] });

  console.log('\n✅ Seed complete!');
  console.log('   Багш:     teacher@demo.mn / demo1234');
  console.log('   Эцэг эх:  parent@demo.mn  / demo1234');
  await mongoose.disconnect();
}

seed().catch(console.error);

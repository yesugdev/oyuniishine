'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api'
import StudentCard from '@/components/student/StudentCard'
import type { Student } from '@/types'

export default function FeaturedStudents() {
  const { data } = useQuery({
    queryKey: ['featured-students'],
    queryFn: () => studentsApi.list({ limit: 6, page: 1 }),
    select: (res) => res.data.students as Student[],
  })

  const DEMO_STUDENTS: Student[] = [
    {
      _id: '1', fullName: 'Энхбаяр Дорж', nickname: 'Энхэ', age: 10, grade: '4',
      class: '4А', birthday: '2016-03-15', profilePhoto: '',
      intro: 'Математик, шатрын авьяастан. Ирээдүйн инженер.',
      isPublic: true, hobbies: ['Шатар', 'Математик', 'Футбол'],
      skills: ['Логик сэтгэлгээ', 'Дэвшилтэт математик'], dreamProfession: 'Инженер',
      traits: ['Тэвчээртэй', 'Ухаантай'], whatMakesSpecial: 'Шатраар бүсийн аварга',
      bestMemory: '', friendQuote: '', teacherComment: 'Маш авьяастай сурагч',
      parentMessage: '', childMessage: '',
      photos: [], videos: [], achievements: [
        { _id: 'a1', title: 'Шатрын тэмцээн 1-р байр', date: '2025-10-01', type: 'award' }
      ], timeline: [], grades: [], aiSummary: '', aiStrengths: ['Математик', 'Логик'],
      teacher: { _id: 't1', name: 'Б.Отгонбаяр' }, reactions: [], viewCount: 124, createdAt: '', updatedAt: ''
    },
    {
      _id: '2', fullName: 'Номин Батэрдэнэ', nickname: 'Номиноо', age: 9, grade: '3',
      class: '3Б', birthday: '2017-06-22', profilePhoto: '',
      intro: 'Зурах, дуулах дуртай урлагийн авьяастан.',
      isPublic: true, hobbies: ['Зурах', 'Дуулах', 'Бүжих'],
      skills: ['Зураг', 'Дуу хоолой', 'Бүжиг'], dreamProfession: 'Уран зураач',
      traits: ['Бүтээлч', 'Хөгжилтэй'], whatMakesSpecial: 'Улсын урлагийн тэмцээний ялагч',
      bestMemory: '', friendQuote: '', teacherComment: 'Онцгой авьяастай охин',
      parentMessage: '', childMessage: '',
      photos: [], videos: [], achievements: [
        { _id: 'a2', title: 'Урлагийн тэмцээн 2-р байр', date: '2025-09-15', type: 'art' }
      ], timeline: [], grades: [], aiSummary: '', aiStrengths: ['Урлаг', 'Бүтээлч'],
      teacher: { _id: 't2', name: 'Х.Сарантуяа' }, reactions: [], viewCount: 98, createdAt: '', updatedAt: ''
    },
    {
      _id: '3', fullName: 'Тэмүүлэн Ганбаатар', nickname: 'Тэмүү', age: 11, grade: '5',
      class: '5А', birthday: '2015-01-10', profilePhoto: '',
      intro: 'Хөлбөмбөгийн авьяастан. Багаараа ялдаг.',
      isPublic: true, hobbies: ['Хөлбөмбөг', 'Гүйлт', 'Дасгал'],
      skills: ['Хөлбөмбөг', 'Удирдах чадвар'], dreamProfession: 'Мэргэжлийн тамирчин',
      traits: ['Тэмүүлэлтэй', 'Багийнхаа', 'Хурдан'], whatMakesSpecial: 'Аймгийн хөлбөмбөгийн аварга',
      bestMemory: '', friendQuote: '', teacherComment: 'Спортын багийн ахлагч',
      parentMessage: '', childMessage: '',
      photos: [], videos: [], achievements: [
        { _id: 'a3', title: 'Хөлбөмбөгийн аймгийн аварга', date: '2025-11-20', type: 'sports' }
      ], timeline: [], grades: [], aiSummary: '', aiStrengths: ['Спорт', 'Удирдагч'],
      teacher: { _id: 't1', name: 'Б.Отгонбаяр' }, reactions: [], viewCount: 156, createdAt: '', updatedAt: ''
    },
  ]

  const students = data?.length ? data : DEMO_STUDENTS

  return (
    <section className="py-24 bg-gradient-to-b from-white to-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-lavender-100 text-lavender-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            🌟 Онцлох сурагчид
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
            Манай гайхалтай{' '}
            <span className="gradient-text">сурагчид</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Тус бүр өөр өөрийн давтагдашгүй авьяас, мөрөөдөлтэй гайхалтай хүүхдүүд
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {students.slice(0, 6).map((student, i) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <StudentCard student={student} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/showcase" className="btn-primary text-base py-4 px-10">
            Бүх сурагчдыг үзэх →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

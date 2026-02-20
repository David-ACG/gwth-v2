import { prisma } from '../src/lib/db/prisma'

async function getCourseId() {
  try {
    const course = await prisma.course.findFirst({
      select: {
        id: true,
        title: true,
        slug: true
      }
    })
    
    if (course) {
      console.log('Course found:')
      console.log('ID:', course.id)
      console.log('Title:', course.title)
      console.log('Slug:', course.slug)
    } else {
      console.log('No course found in database')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getCourseId()
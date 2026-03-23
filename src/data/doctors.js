import doc1 from '../assets/doc1.jpg'
import doc2 from '../assets/doc2.jpg'
import doc3 from '../assets/doc3.jpeg'
import doc4 from '../assets/doc4.jpeg'
import doc5 from '../assets/doc5.jpeg'
import doc7 from '../assets/doc7.png'

export const doctors = [
  {
    name: 'Dr. John Doe',
    specialty: 'Pediatrician',
    image: doc1,
    rating: 4.5,
    slots: {
      monday: ['09:00 AM', '10:30 AM', '12:00 PM'],
      wednesday: ['09:30 AM', '11:00 AM', '01:00 PM'],
      friday: ['10:00 AM', '12:30 PM', '03:00 PM'],
    },
  },
  {
    name: 'Dr. Jane Smith',
    specialty: 'Pediatrician',
    image: doc2,
    rating: 4.8,
    slots: {
      tuesday: ['09:00 AM', '11:30 AM', '02:00 PM'],
      thursday: ['10:00 AM', '12:00 PM', '04:00 PM'],
      saturday: ['09:30 AM', '11:00 AM'],
    },
  },
  {
    name: 'Dr. Robert Johnson',
    specialty: 'Pediatrician',
    image: doc3,
    rating: 4.7,
    slots: {
      monday: ['10:00 AM', '01:00 PM'],
      thursday: ['09:30 AM', '12:30 PM', '03:30 PM'],
      saturday: ['10:30 AM', '01:30 PM'],
    },
  },
  {
    name: 'Dr. Kim Lee',
    specialty: 'Pediatrician',
    image: doc4,
    rating: 4.6,
    slots: {
      tuesday: ['10:00 AM', '01:00 PM', '03:00 PM'],
      friday: ['09:00 AM', '11:00 AM', '02:30 PM'],
      saturday: ['09:30 AM', '12:00 PM'],
    },
  },
  {
    name: 'Dr. Annamma Mathew',
    specialty: 'Pediatrician',
    image: doc5,
    rating: 5.0,
    slots: {
      monday: ['08:30 AM', '10:00 AM', '12:00 PM'],
      wednesday: ['09:00 AM', '11:30 AM', '02:30 PM'],
      friday: ['10:30 AM', '01:00 PM'],
    },
  },
  {
    name: 'Dr. Abhinav P',
    specialty: 'Gynecologist',
    image: doc7,
    rating: 5.0,
    slots: {
      tuesday: ['11:00 AM', '01:30 PM'],
      thursday: ['10:30 AM', '02:00 PM'],
    },
  },
]

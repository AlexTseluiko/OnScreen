import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Facility } from '../models/Facility';

dotenv.config();

const facilities = [
  {
    name: 'Городская больница №1',
    address: 'ул. Ленина, 10',
    description: 'Крупная многопрофильная больница с современным оборудованием',
    rating: 4.5,
    reviews: 120,
    coordinates: {
      lat: 55.7558,
      lng: 37.6173
    },
    services: ['Терапия', 'Хирургия', 'Кардиология', 'Неврология'],
    workingHours: {
      'monday': { open: '08:00', close: '20:00' },
      'tuesday': { open: '08:00', close: '20:00' },
      'wednesday': { open: '08:00', close: '20:00' },
      'thursday': { open: '08:00', close: '20:00' },
      'friday': { open: '08:00', close: '20:00' },
      'saturday': { open: '09:00', close: '18:00' },
      'sunday': { open: '09:00', close: '18:00' }
    },
    type: 'hospital',
    phone: '+7 (495) 123-45-67',
    email: 'hospital1@example.com',
    website: 'https://hospital1.example.com',
    isVerified: true
  },
  {
    name: 'Медицинский центр "Здоровье"',
    address: 'пр. Мира, 25',
    description: 'Современный медицинский центр с широким спектром услуг',
    rating: 4.8,
    reviews: 85,
    coordinates: {
      lat: 55.7517,
      lng: 37.6178
    },
    services: ['Диагностика', 'УЗИ', 'МРТ', 'Лабораторные исследования'],
    workingHours: {
      'monday': { open: '09:00', close: '21:00' },
      'tuesday': { open: '09:00', close: '21:00' },
      'wednesday': { open: '09:00', close: '21:00' },
      'thursday': { open: '09:00', close: '21:00' },
      'friday': { open: '09:00', close: '21:00' },
      'saturday': { open: '10:00', close: '20:00' },
      'sunday': { open: '10:00', close: '20:00' }
    },
    type: 'clinic',
    phone: '+7 (495) 234-56-78',
    email: 'health@example.com',
    website: 'https://health.example.com',
    isVerified: true
  },
  {
    name: 'Аптека "Фарма+"',
    address: 'ул. Гагарина, 15',
    description: 'Круглосуточная аптека с широким ассортиментом лекарств',
    rating: 4.2,
    reviews: 45,
    coordinates: {
      lat: 55.7539,
      lng: 37.6208
    },
    services: ['Лекарства', 'Медицинские товары', 'Консультация фармацевта'],
    workingHours: {
      'monday': { open: '00:00', close: '23:59' },
      'tuesday': { open: '00:00', close: '23:59' },
      'wednesday': { open: '00:00', close: '23:59' },
      'thursday': { open: '00:00', close: '23:59' },
      'friday': { open: '00:00', close: '23:59' },
      'saturday': { open: '00:00', close: '23:59' },
      'sunday': { open: '00:00', close: '23:59' }
    },
    type: 'pharmacy',
    phone: '+7 (495) 345-67-89',
    email: 'pharma@example.com',
    isVerified: true
  }
];

const seedFacilities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Очищаем существующие данные
    await Facility.deleteMany({});
    console.log('Cleared existing facilities');

    // Добавляем тестовые данные
    await Facility.insertMany(facilities);
    console.log('Added test facilities');

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedFacilities(); 
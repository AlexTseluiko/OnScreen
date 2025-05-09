import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  rating: number;
  text: string;
  photos: string[];
  likes: mongoose.Types.ObjectId[];
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clinic: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    photos: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
ReviewSchema.index({ clinic: 1, createdAt: -1 });

// Middleware для обновления рейтинга клиники
ReviewSchema.post('save', async function () {
  const Review = this.constructor as mongoose.Model<IReview>;
  const clinicId = this.clinic;

  const stats = await Review.aggregate([
    { $match: { clinic: clinicId } },
    {
      $group: {
        _id: '$clinic',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Clinic').findByIdAndUpdate(clinicId, {
      rating: stats[0].averageRating,
      reviewsCount: stats[0].totalReviews,
    });
  }
});

// Создаем и экспортируем модель
export const Review = mongoose.model<IReview>('Review', ReviewSchema);

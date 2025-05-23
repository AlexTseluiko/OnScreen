import { Schema, model, Document } from 'mongoose';

export interface ScreeningTest {
  name: string;
  nameRu: string;
  nameUk: string;
  description: string;
  descriptionRu: string;
  descriptionUk: string;
  price: number;
  duration: number;
  preparation: string;
  preparationRu: string;
  preparationUk: string;
  results: string;
  resultsRu: string;
  resultsUk: string;
}

export interface ScreeningProgramDocument extends Document {
  title: string;
  titleRu: string;
  titleUk: string;
  description: string;
  descriptionRu: string;
  descriptionUk: string;
  details: string;
  detailsRu: string;
  detailsUk: string;
  riskFactors: string[];
  riskFactorsRu: string[];
  riskFactorsUk: string[];
  frequency: string;
  frequencyRu: string;
  frequencyUk: string;
  nextScreening?: string;
  category: string;
  categoryRu: string;
  categoryUk: string;
  tests: ScreeningTest[];
  benefits: string[];
  benefitsRu: string[];
  benefitsUk: string[];
  preparation: string;
  preparationRu: string;
  preparationUk: string;
  aftercare: string;
  aftercareRu: string;
  aftercareUk: string;
  recommendedFor: string[];
  recommendedForRu: string[];
  recommendedForUk: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningTestSchema = new Schema<ScreeningTest>(
  {
    name: { type: String, required: true },
    nameRu: { type: String, required: true },
    nameUk: { type: String, required: true },
    description: { type: String, required: true },
    descriptionRu: { type: String, required: true },
    descriptionUk: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    preparation: { type: String, required: true },
    preparationRu: { type: String, required: true },
    preparationUk: { type: String, required: true },
    results: { type: String, required: true },
    resultsRu: { type: String, required: true },
    resultsUk: { type: String, required: true },
  },
  { _id: false }
);

const ScreeningProgramSchema = new Schema<ScreeningProgramDocument>(
  {
    title: { type: String, required: true },
    titleRu: { type: String, required: true },
    titleUk: { type: String, required: true },
    description: { type: String, required: true },
    descriptionRu: { type: String, required: true },
    descriptionUk: { type: String, required: true },
    details: { type: String, required: true },
    detailsRu: { type: String, required: true },
    detailsUk: { type: String, required: true },
    riskFactors: { type: [String], default: [] },
    riskFactorsRu: { type: [String], default: [] },
    riskFactorsUk: { type: [String], default: [] },
    frequency: { type: String, required: true },
    frequencyRu: { type: String, required: true },
    frequencyUk: { type: String, required: true },
    nextScreening: { type: String },
    category: { type: String, required: true },
    categoryRu: { type: String, required: true },
    categoryUk: { type: String, required: true },
    tests: { type: [ScreeningTestSchema], default: [] },
    benefits: { type: [String], default: [] },
    benefitsRu: { type: [String], default: [] },
    benefitsUk: { type: [String], default: [] },
    preparation: { type: String, required: true },
    preparationRu: { type: String, required: true },
    preparationUk: { type: String, required: true },
    aftercare: { type: String, required: true },
    aftercareRu: { type: String, required: true },
    aftercareUk: { type: String, required: true },
    recommendedFor: { type: [String], default: [] },
    recommendedForRu: { type: [String], default: [] },
    recommendedForUk: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default model<ScreeningProgramDocument>('ScreeningProgram', ScreeningProgramSchema);

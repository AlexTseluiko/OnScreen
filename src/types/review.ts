export interface APIReview {
  id: number;
  rating: number;
  text: string;
  author: string;
  date: Date;
  photos?: string[];
}

export interface ReviewFormData {
  rating: number;
  text: string;
  photos?: string[];
}

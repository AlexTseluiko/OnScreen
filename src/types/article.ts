export interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  isBookmarked?: boolean;
}

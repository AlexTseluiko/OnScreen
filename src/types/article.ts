export interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  status: 'published' | 'draft';
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

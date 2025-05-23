export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  article: string;
  parentComment?: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

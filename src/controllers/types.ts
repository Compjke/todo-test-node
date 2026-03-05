export type User = {
  id: string;
  userName: string;
  password: string;
  createdAt: string;
};

export type Todo = {
  id: string;
  title: string;
  description: string;
  isDone: boolean;
  createdAt: string;
  userId: string;
};

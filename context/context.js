import { createContext } from "react";

export const UserContext = createContext({
  user: null,
  setUser: () => {},
});

export const AuthContext = createContext({
  isAuth: false,
  setIsAuth: () => {},
});
export const ListenContext = createContext({
  isListening: false,
  setIsListening: () => {},
});

export const DataContext = createContext({
  data: [],
  setData: () => {},
});

export const PostContext = createContext({
  post: { graphics: [] },
  setPost: () => {},
});

export const ReviewContext = createContext({
  review: {},
  setReview: () => {},
});

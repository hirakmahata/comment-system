import { useState } from "react";
import { createContext } from "react";

export const CommentContext = createContext();

export const CommentContextProvider = ({ children }) => {
    const [comments, setComments] = useState([]);
  return (
    <CommentContext.Provider value={[comments, setComments]}>
      {children}
    </CommentContext.Provider>
  );
};

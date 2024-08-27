import { useContext, useState } from "react";
import "./Filter.css";
import { CommentContext } from "../../context/CommentContext";

const Filter = ({ totalComments }) => {
  const [active, setActive] = useState("latest");
  const [comments, setComments] = useContext(CommentContext);

  const filterLatest = () => {
    if (active === "latest") return;

    const sortedByDate = [...comments].sort((a, b) => {
      return b.createdAt.toDate() - a.createdAt.toDate();
    });

    setComments(sortedByDate);
    setActive("latest");
  };

  const filterPopular = () => {
    if (active === "popular") return;

    const getTotalReactions = (comment) => {
      return Object.values(comment.reactions || {}).reduce(
        (acc, count) => acc + count,
        0
      );
    };

    const sortedByReactions = [...comments].sort(
      (a, b) => getTotalReactions(b) - getTotalReactions(a)
    );
    setComments(sortedByReactions);
    setActive("popular");
  };

  return (
    <div className="filter-container">
      <span className="heading">Comments({totalComments})</span>
      <span>
        <button
          onClick={filterLatest}
          className={`filter ${active === "latest" ? "filter-active" : ""}`}
          id="latest"
        >
          Latest
        </button>
        <button
          onClick={filterPopular}
          className={`filter ${active === "popular" ? "filter-active" : ""}`}
          id="popular"
        >
          Popular
        </button>
      </span>
    </div>
  );
};

export default Filter;

import "./Comments.css";
import { lazy, useContext, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { getComments, updateCommentReactions } from "../../firebaseFunctions";
import { getOptionByVarient } from "../../utils/myFunctions";
import { CommentContext } from "../../context/CommentContext";
const Loader = lazy(() => import("../loader/Loader"));
const InputBox = lazy(() => import("../inputBox/InputBox"));
const SingleComment = lazy(() => import("../single-comment/SingleComment"));

const Comments = ({ setTotalComments }) => {
  const [comments, setComments] = useContext(CommentContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const commentsPerPage = 5;
  const lastIndex = currentPage * commentsPerPage;
  const firstIndex = lastIndex - commentsPerPage;
  const paginatedComments = comments.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(comments.length / commentsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  const { enqueueSnackbar } = useSnackbar();

  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCurrentPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== nPage) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handleReact = async (
    commentId,
    emoji,
    level,
    parentId,
    grandParentId
  ) => {
    setLoading(true); // Start loading
    setError(null); // Reset error state

    try {
      const updatedComments = comments.map((comment) => {
        if (level === 0 && comment.id === commentId) {
          // Update reaction for the comment
          const newReactions = { ...comment.reactions };
          if (newReactions[emoji]) {
            newReactions[emoji] += 1;
          } else {
            newReactions[emoji] = 1;
          }
          return { ...comment, reactions: newReactions };
        } else if (level === 1) {
          // Update reaction for a reply
          const updatedReplies = comment.replies.map((reply) => {
            if (reply.id === commentId) {
              const newReactions = { ...reply.reactions };
              if (newReactions[emoji]) {
                newReactions[emoji] += 1;
              } else {
                newReactions[emoji] = 1;
              }
              return { ...reply, reactions: newReactions };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        } else if (level === 2) {
          // Update reaction for a reply of a reply
          const updatedReplies = comment.replies.map((reply) => {
            if (reply.id === parentId) {
              const updatedRepliesOfReplies = reply.replies.map(
                (replyOfReply) => {
                  if (replyOfReply.id === commentId) {
                    const newReactions = { ...replyOfReply.reactions };
                    if (newReactions[emoji]) {
                      newReactions[emoji] += 1;
                    } else {
                      newReactions[emoji] = 1;
                    }
                    return { ...replyOfReply, reactions: newReactions };
                  }
                  return replyOfReply;
                }
              );
              return { ...reply, replies: updatedRepliesOfReplies };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });

      setComments(updatedComments);

      await updateCommentReactions(
        commentId,
        emoji,
        level,
        parentId,
        grandParentId
      );
    } catch (error) {
      setError("An error occurred while updating reactions. Please try again.");
      enqueueSnackbar(
        "An error occurred while updating reactions. Please try again.",
        getOptionByVarient("error")
      );
      console.error("Error updating reactions:", error);
    } finally {
      setLoading(false);
      console.log("reaction done bro");
    }
  };

  // useEffect(() => {
  //   const fetchComments = async () => {
  //     const commentsData = await getComments();
  //     setComments(commentsData);
  //   };
  //   fetchComments();
  //   setTotalComments(comments.length);
  // }, [comments]);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const commentsData = await getComments();
        setComments(commentsData);
        setTotalComments(commentsData.length);
      } catch (err) {
        setError("Failed to load comments. Please try again later.");
        enqueueSnackbar(error, getOptionByVarient("warning"));
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  return (
    <>
      <InputBox
        comment={comments}
        refreshComments={async () => {
          const updatedComments = await getComments();
          setComments(updatedComments);
        }}
        loading={loading}
        error={error}
        setLoading={setLoading}
        setError={setError}
      />
      {paginatedComments.length > 0 && (
        <div className="comments-container">
          {paginatedComments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              refreshComments={async () => {
                const updatedComments = await getComments();
                setComments(updatedComments);
              }}
              onReact={handleReact}
              loading={loading}
              error={error}
              setLoading={setLoading}
              setError={setError}
            />
          ))}
        </div>
      )}
      {loading && <Loader />}
      {numbers.length > 1 && (
        <nav>
          <ul className="pagination">
            <li onClick={prePage} className="page-item">
              prev
            </li>
            {numbers.map((n, i) => (
              <li
                key={i}
                onClick={() => changeCurrentPage(n)}
                className={`page-item ${
                  currentPage === n ? "active-page" : ""
                }`}
              >
                {n}
              </li>
            ))}
            <li onClick={nextPage} className="page-item">
              next
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Comments;

import { lazy, useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import avatar from "../../assets/avatar.png";
import "./SingleComment.css";
import { LiaLaugh } from "react-icons/lia";
const InputBox = lazy(() => import("../inputBox/InputBox"));

const SingleComment = ({
  comment,
  refreshComments,
  onReact,
  loading,
  error,
  setLoading,
  setError,
  level = 0,
}) => {
  const emojiList = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉"];
  const [showEmojis, setShowEmojis] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const TEXT = comment.text;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    const element = commentRef.current;
    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
    const maxHeight = lineHeight * 5;

    if (element.scrollHeight > maxHeight) {
      setShowToggle(true);
    }
  }, []);

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEmojiClick = (emoji) => {
    onReact(comment.id, emoji, level, comment.parentId, comment.grandParentId);
    setShowEmojis(false);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const timeAgo = formatTimeAgo(comment?.createdAt?.toDate());

  return (
    <div
      style={{ marginLeft: `${level * 2}rem` }}
      className="comment-replyInput-container"
    >
      <div className="single-comment-container">
        <div className="user-info">
          <img
            src={comment?.photo ? comment?.photo : avatar}
            alt="user-profile-pic"
          />
          <p>{comment?.auther}</p>
        </div>
        <div
          ref={commentRef}
          style={{
            maxHeight: isExpanded ? "none" : "5em",
            lineHeight: "1em",
            transition: "max-height 0.3s ease",
          }}
          className="comment-text"
          dangerouslySetInnerHTML={{ __html: TEXT }}
        />
        {comment.fileUrl && (
          <a href={comment.fileUrl} target="_blank">
            <img id="commentImage" src={comment.fileUrl} alt="attached-image" />
          </a>
        )}
        {showToggle && (
          <button className="show-less-more-button" onClick={toggleText}>
            {isExpanded ? "🔼 Show less" : "🔽 Show more"}
          </button>
        )}
        <div className="comment-info">
          <div>
            <LiaLaugh onClick={() => setShowEmojis(!showEmojis)} size={25} />
          </div>
          {showEmojis && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "2.3rem",
                zIndex: 1000,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "0 9px 9px 9px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem 0.5rem",
                display: "flex",
                gap: "10px",
              }}
            >
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  style={{
                    fontSize: "1.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "scale(1.5)")
                  }
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          {comment?.reactions &&
            Object.entries(comment?.reactions).map(([emoji, count]) => (
              <span key={emoji} className="reacted-emoji">
                {emoji}
                {count}
              </span>
            ))}
          {level <= 1 && (
            <div className="reply" onClick={() => setIsReplying(true)}>
              Reply
            </div>
          )}
          <div className="time">{timeAgo}</div>
        </div>
        {comment?.replies && comment?.replies?.length > 0 && (
          <div>
            {comment?.replies.map((reply) => (
              <SingleComment
                key={reply.id}
                comment={reply}
                refreshComments={refreshComments}
                onReact={onReact}
                loading={loading}
                error={error}
                setLoading={setLoading}
                setError={setError}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
      {isReplying && (
        <InputBox
          comment={comment}
          refreshComments={refreshComments}
          loading={loading}
          error={error}
          setLoading={setLoading}
          setError={setError}
          stopReply={() => setIsReplying(false)}
          level={level + 1}
        />
      )}
    </div>
  );
};

export default SingleComment;

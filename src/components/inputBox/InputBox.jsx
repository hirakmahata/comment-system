import { useContext, useEffect, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import { VscError } from "react-icons/vsc";
import "./InputBox.css";
import { GrAttachment } from "react-icons/gr";
import { UserContext } from "../../context/UserContext";
import {
  addComment,
  addReply,
  addReplyToReply,
  uploadImage,
} from "../../firebaseFunctions";
import {
  extractTextFromHTML,
  getOptionByVarient,
} from "../../utils/myFunctions";

const InputBox = ({
  comment,
  refreshComments,
  loading,
  error,
  setLoading,
  setError,
  stopReply = null,
  level = 0,
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [content, setContent] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [file, setFile] = useState(null);

  const [user] = useContext(UserContext);

  const { enqueueSnackbar } = useSnackbar();

  const handleInput = (e) => {
    setContent(e.target.innerHTML);
  };

  const setCursorToEnd = () => {
    const el = editorRef.current;
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(el);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleFormat = (command) => {
    editorRef.current.focus();
    document.execCommand(command, false, null);

    switch (command) {
      case "bold":
        setIsBold(!isBold);
        break;
      case "italic":
        setIsItalic(!isItalic);
        break;
      case "underline":
        setIsUnderline(!isUnderline);
        break;
      default:
        break;
    }
  };

  const handleSubmtComment = async () => {
    if (!user) {
      enqueueSnackbar(
        "Please Login to post a comment",
        getOptionByVarient("warning")
      );
      return;
    }

    if (content.length === 0) {
      enqueueSnackbar(
        "Please write something to post a comment.",
        getOptionByVarient("warning")
      );
      return;
    }

    const commentText = extractTextFromHTML(content);

    if (commentText.length > 250) {
      enqueueSnackbar(
        "You have exceed 250 characters. Write less to post a comment",
        getOptionByVarient("warning")
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let ATTACHED_IMAGE_URL = null;
      if (file) {
        ATTACHED_IMAGE_URL = await uploadImage(file);
      }

      if (level === 0) {
        await addComment(content, user, ATTACHED_IMAGE_URL);
      } else if (level === 1) {
        await addReply(comment.id, content, user, ATTACHED_IMAGE_URL);
      } else {
        await addReplyToReply(
          comment.parentId,
          comment.id,
          content,
          user,
          ATTACHED_IMAGE_URL
        );
      }
      await refreshComments();
    } catch (err) {
      setError(
        "An error occurred while posting your comment. Please try again."
      );
      enqueueSnackbar(err, getOptionByVarient("error"));
      console.error("Error posting comment:", err);
    } finally {
      setLoading(false);
      setContent("");
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setSelectedImage(null);
      setFile(null);
      if (level > 0 && stopReply !== null) stopReply();
    }
  };

  const handleIconClick = () => {
    // Trigger the file input click event
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setSelectedImage(imageUrl);
      setFile(selectedFile);
    }
  };

  const handleCancel = () => {
    fileInputRef.current.value = null;
    setSelectedImage(null);
    setFile(null);
  };

  useEffect(() => {
    setCursorToEnd();
  }, [content]);

  return (
    <div className="input-box-container">
      <div
        className="input-editor"
        contentEditable
        ref={editorRef}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
      {selectedImage && (
        <div
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <img
            src={selectedImage}
            alt="Selected"
            style={{ maxWidth: "100%", display: "block" }}
          />

          <VscError
            onClick={handleCancel}
            size={30}
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              cursor: "pointer",
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
            }}
          />
        </div>
      )}
      <div className="toolbar-container">
        <div className="toolbar">
          <button
            onClick={() => handleFormat("bold")}
            className={isBold ? "active" : ""}
          >
            <b>B</b>
          </button>
          <button
            onClick={() => handleFormat("italic")}
            className={isItalic ? "active" : ""}
          >
            <i>I</i>
          </button>
          <button
            onClick={() => handleFormat("underline")}
            className={isUnderline ? "active" : ""}
          >
            <u>U</u>
          </button>
          <button>
            <GrAttachment size={25} onClick={handleIconClick} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </button>
        </div>
        <div className="button-container">
          {level > 0 && (
            <button onClick={stopReply} className="cancel-button">
              Cancel
            </button>
          )}
          <button onClick={handleSubmtComment} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBox;

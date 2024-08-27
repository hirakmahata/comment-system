import {
  firestore,
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  increment,
  storage,
  ref,
  getDownloadURL,
  uploadBytes,
} from "./firebase";

export const addComment = async (content, user, imageURL = null) => {
  try {
    const commentsRef = collection(firestore, "comments");
    const commentDoc = doc(commentsRef);
    await setDoc(commentDoc, {
      autherId: user.uid,
      text: content,
      auther: user.displayName,
      fileUrl: imageURL,
      photo: user.photoURL,
      createdAt: new Date(),
      parentId: null,
      grandParentId: null,
    });
  } catch (error) {
    console.error("Error occurred while adding comment..", error);
    throw error;
  }
};

export const addReply = async (commentId, content, user, imageURL = null) => {
  try {
    const repliesRef = collection(firestore, "comments", commentId, "replies");
    const replyDoc = doc(repliesRef);
    await setDoc(replyDoc, {
      autherId: user.uid,
      text: content,
      auther: user.displayName,
      fileUrl: imageURL,
      photo: user.photoURL,
      createdAt: new Date(),
      parentId: commentId,
      grandParentId: null,
    });
  } catch (error) {
    console.error("Error occurred while adding reply..", error);
    throw error;
  }
};

export const addReplyToReply = async (
  commentId,
  replyId,
  content,
  user,
  imageURL = null
) => {
  try {
    const repliesOfRepliesRef = collection(
      firestore,
      "comments",
      commentId,
      "replies",
      replyId,
      "replies"
    );

    const replyToReplyDoc = doc(repliesOfRepliesRef);

    await setDoc(replyToReplyDoc, {
      autherId: user.uid,
      text: content,
      auther: user.displayName,
      fileUrl: imageURL,
      photo: user.photoURL,
      createdAt: new Date(),
      parentId: replyId,
      grandParentId: commentId,
    });
  } catch (error) {
    console.error("Error occurred while adding reply of reply..", error);
    throw error;
  }
};

export const getComments = async () => {
  try {
    const commentsRef = collection(firestore, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
    const commentsSnapshot = await getDocs(commentsQuery);

    const comments = [];

    for (const commentDoc of commentsSnapshot.docs) {
      const commentData = commentDoc.data();

      const repliesRef = collection(commentDoc.ref, "replies");
      const repliesQuery = query(repliesRef, orderBy("createdAt", "desc"));
      const repliesSnapshot = await getDocs(repliesQuery);

      const replies = [];

      for (const replyDoc of repliesSnapshot.docs) {
        const replyData = replyDoc.data();

        const repliesOfRepliesRef = collection(replyDoc.ref, "replies");
        const repliesOfRepliesQuery = query(
          repliesOfRepliesRef,
          orderBy("createdAt", "desc")
        );
        const repliesOfRepliesSnapshot = await getDocs(repliesOfRepliesQuery);

        const repliesOfReplies = repliesOfRepliesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        replies.push({
          id: replyDoc.id,
          ...replyData,
          replies: repliesOfReplies,
        });
      }

      comments.push({ id: commentDoc.id, ...commentData, replies });
    }

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const updateCommentReactions = async (
  commentId,
  emoji,
  level,
  parentId,
  grandParentId
) => {
  let commentRef;

  try {
    if (level === 0) {
      // Comment level
      commentRef = doc(firestore, "comments", commentId);
    } else if (level === 1) {
      // Reply level
      commentRef = doc(firestore, "comments", parentId, "replies", commentId);
    } else if (level === 2) {
      // Reply of reply level
      commentRef = doc(
        firestore,
        "comments",
        grandParentId,
        "replies",
        parentId,
        "replies",
        commentId
      );
    } else {
      throw new Error("Invalid level provided");
    }

    await updateDoc(commentRef, {
      [`reactions.${emoji}`]: increment(1),
    });
  } catch (error) {
    console.error("Error updating comment reactions:", error);
    throw error;
  }
};

// Function to handle image upload
export const uploadImage = async (file) => {
  if (!file) return;

  const storageRef = ref(storage, `images/${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading the file", error);
    throw error;
  }
};

# Dynamic Comment System

This project implements a dynamic comment system with rich text features, Google Authentication, file attachments, tagging, sorting, and pagination. The system is built using React for the frontend and Firebase for authentication, storage, and database management.

## Features

- **Google Authentication:** Users can sign in using their Google account to post comments.
- **Rich Text Input:** Supports bold, italic, underline formatting within comments. Users can attach image files.
- **Comment Sorting:** Comments can be sorted by the latest or by popularity (based on reactions).
- **Comment Features:**
  - Displays the user’s profile picture, name, and comment text.
  - Includes reaction buttons with counts.
  - Allows replies to comments, supporting up to two levels of nested replies.
  - Displays comment timestamps (e.g., seconds, minutes, hours, days ago).
  - "Show more/less" functionality for comments longer than 5 lines.
  - Thumbnails for attached images.
- **Pagination:** Displays 8 comments per page with pagination controls.
- **Error Handling:** Includes empty state handling, success, and failure toast messages.


# NovaAI API Documentation

Base URL: `http://localhost:8080/api`

## Health
- `GET /health` - Health check status.

## Conversations & Chat
- `POST /chat` - Send a message or start a conversation.
- `GET /chats` - Get all conversations (supports search query `?q=...` & workspace filter `?workspaceId=...`).
- `GET /chats/{id}` - Get conversation details with message history.
- `PUT /chats/{id}` - Rename conversation or update folder/workspace.
- `DELETE /chats/{id}` - Delete conversation.
- `POST /chats/{id}/regenerate` - Regenerate last AI response.

## Files
- `POST /files/upload` - Upload document file (PDF, TXT, DOCX, CSV, XLSX). Returns extracted text summary.
- `GET /files` - List uploaded files.
- `GET /files/{id}` - Get file details or download.
- `DELETE /files/{id}` - Delete uploaded file.

## Images
- `POST /images/upload` - Upload image (PNG, JPG, WEBP) for vision analysis.

## Folders
- `POST /folders` - Create folder.
- `GET /folders` - Get folder tree structure.
- `PUT /folders/{id}` - Update folder name/location.
- `DELETE /folders/{id}` - Delete folder.

## Workspaces
- `POST /workspaces` - Create workspace.
- `GET /workspaces` - Get user workspaces.
- `PUT /workspaces/{id}` - Update workspace.
- `DELETE /workspaces/{id}` - Delete workspace.

## Search
- `GET /search?q={query}` - Global search across conversations, messages, files, and folders.

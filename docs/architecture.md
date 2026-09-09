# NovaAI Architecture Documentation

## Overview
NovaAI is a modern full-stack AI workspace platform offering chat assistance, document analysis, image understanding, code generation, and project file organization into Workspaces & Folders.

## Architecture Flow

```text
+-----------------------------------------------------------------------------------+
|                                  Frontend (React + Vite)                          |
|  - UI Components, Theme, Chat Context, Markdown & Code Rendering, File Uploads    |
+-----------------------------------------------------------------------------------+
                                          |
                                    REST APIs (Axios)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                               Backend (Spring Boot 3)                             |
|                                                                                   |
|  +--------------------+     +---------------------+     +----------------------+  |
|  | Controllers        | --> | Services            | --> | Repositories (JPA)   |  |
|  | (Chat, File, etc)  |     | (ChatService, etc)  |     | (Database Access)    |  |
|  +--------------------+     +---------------------+     +----------------------+  |
|                                        |                            |             |
|                                        v                            v             |
|                             +--------------------+       +---------------------+  |
|                             | AiService          |       | MySQL Database      |  |
|                             +--------------------+       +---------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                                  HTTPS REST API
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        AI Gateway (Latentstack / OpenAI / Gemini)                 |
|                   * API Credentials managed safely on server-side *               |
+-----------------------------------------------------------------------------------+
```

## System Components

### 1. Frontend Layer
- **Framework**: React.js 18 + Vite
- **Styling**: Tailored Modern CSS with flexbox/grid, CSS variables for dark/light themes, smooth transitions, glassmorphism cards.
- **Routing**: React Router DOM v6
- **State Management**: React Context API (`ChatContext`, `WorkspaceContext`, `ThemeContext`)
- **Key Libraries**: Axios, Lucide React (Icons), React Markdown, Syntax Highlighting.

### 2. Backend Layer
- **Framework**: Java 17 + Spring Boot 3.2+
- **Data Persistence**: Spring Data JPA + Hibernate + MySQL
- **File Parsing**: Apache PDFBox (PDFs), Apache POI (DOCX/XLSX), Plain Text parsers
- **Error Handling**: `@ControllerAdvice` with standardized REST response wrappers.

### 3. AI Service Integration
- Server-side REST template or HTTP client calling AI Gateway.
- Context management: Summarizes or truncates long conversation histories to fit within optimal context limits.
- Supports specialized modes (General, Coding, Study, Writing, Document Analysis, Brainstorming) by prepending custom system prompt directives.

### 4. Database Schema
- `workspaces`: High-level organizational containers
- `folders`: Hierarchical sub-containers with parent-child support
- `conversations`: Chat sessions attached to folders or workspaces
- `messages`: Individual messages in chats, holding prompt context or file metadata
- `uploaded_files`: Store file metadata, file storage path, and extracted plain text content

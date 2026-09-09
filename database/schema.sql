CREATE DATABASE IF NOT EXISTS novaai_db;
USE novaai_db;

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'folder',
    color VARCHAR(50) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    workspace_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_folder_parent FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_folder_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    mode VARCHAR(50) DEFAULT 'General',
    model VARCHAR(50) DEFAULT 'gemini-3.7-flash',
    folder_id BIGINT DEFAULT NULL,
    workspace_id BIGINT DEFAULT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_conv_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
    CONSTRAINT fk_conv_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'ai'
    content TEXT NOT NULL,
    image_url VARCHAR(512),
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Uploaded Files table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    extracted_text LONGTEXT,
    folder_id BIGINT DEFAULT NULL,
    workspace_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
    CONSTRAINT fk_file_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Seed initial Default Workspace
INSERT INTO workspaces (id, name, description, icon, color) 
VALUES (1, 'Personal', 'Default personal workspace', 'user', '#3b82f6')
ON DUPLICATE KEY UPDATE name=name;

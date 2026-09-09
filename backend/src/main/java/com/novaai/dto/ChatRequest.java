package com.novaai.dto;

public class ChatRequest {
    private Long conversationId;
    private String prompt;
    private String mode = "General";
    private String model = "gemini-3.6-flash";
    private Long workspaceId;
    private Long folderId;
    private String imageUrl;
    private String fileContent;
    private String fileName;

    public ChatRequest() {}

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getPrompt() { 
        return (prompt != null && !prompt.isBlank()) ? prompt : content; 
    }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    private String content;
    public String getContent() { return getPrompt(); }
    public void setContent(String content) { this.content = content; if (this.prompt == null) this.prompt = content; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Long getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }

    public Long getFolderId() { return folderId; }
    public void setFolderId(Long folderId) { this.folderId = folderId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}

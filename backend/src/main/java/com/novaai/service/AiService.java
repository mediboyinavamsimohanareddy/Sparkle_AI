package com.novaai.service;

import com.novaai.config.AiConfig;
import com.novaai.entity.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    @Autowired
    private AiConfig aiConfig;

    @Autowired
    private RestTemplate restTemplate;

    public String generateResponse(String prompt, List<Message> history, String mode, String modelOverride, String imageUrl, String fileContent) {
        String apiKey = aiConfig.getApiKey();
        String baseUrl = aiConfig.getBaseUrl();
        String model = (modelOverride != null && !modelOverride.isBlank()) ? modelOverride : aiConfig.getModel();

        // Map UI model selections to active Gemini models with available quota
        if (model == null || model.isBlank() || model.contains("1.5") || model.contains("2.5") || model.contains("3.6") || model.contains("8b") || model.startsWith("gpt") || model.startsWith("claude") || model.startsWith("llama")) {
            model = "gemini-3.5-flash-lite";
        }

        // System Instruction / Mode Directive
        String systemInstruction = getSystemInstruction(mode);

        // If API key is missing or placeholder, return informative error message
        if (apiKey == null || apiKey.isBlank() || apiKey.equalsIgnoreCase("your_ai_api_key_here")) {
            return "Error: Gemini API Key is not configured in the backend environment (GEMINI_API_KEY).";
        }

        // Prepare full prompt text with file or image context
        StringBuilder currentContent = new StringBuilder();
        if (fileContent != null && !fileContent.isBlank()) {
            currentContent.append("[Attached Document Context]:\n")
                    .append(fileContent.length() > 3000 ? fileContent.substring(0, 3000) + "..." : fileContent)
                    .append("\n\n");
        }
        if (imageUrl != null && !imageUrl.isBlank()) {
            currentContent.append("[Attached Image]: ").append(imageUrl).append("\n\n");
        }
        currentContent.append(prompt);

        // Strategy 1: OpenAI-compatible Endpoint (e.g., https://generativelanguage.googleapis.com/v1beta/openai/chat/completions)
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey.trim());

            List<Map<String, Object>> messagesPayload = new ArrayList<>();
            messagesPayload.add(Map.of("role", "system", "content", systemInstruction));

            if (history != null) {
                int end = history.size();
                if (end > 0 && "user".equalsIgnoreCase(history.get(end - 1).getSender())) {
                    end--;
                }
                int start = Math.max(0, end - 10);
                for (int i = start; i < end; i++) {
                    Message m = history.get(i);
                    String role = "user".equalsIgnoreCase(m.getSender()) ? "user" : "assistant";
                    messagesPayload.add(Map.of("role", role, "content", m.getContent()));
                }
            }
            messagesPayload.add(Map.of("role", "user", "content", currentContent.toString()));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messagesPayload);
            requestBody.put("temperature", 0.7);

            String endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : (baseUrl.endsWith("/") ? baseUrl + "chat/completions" : baseUrl + "/chat/completions");
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map responseBody = response.getBody();
                List choices = (List) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map messageMap = (Map) firstChoice.get("message");
                    if (messageMap != null && messageMap.get("content") != null) {
                        return (String) messageMap.get("content");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("OpenAI-compatible endpoint failed: " + e.getMessage());
        }

        // Strategy 2: Native Google Gemini REST API (https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key})
        try {
            String geminiNativeUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey.trim();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> nativePayload = new HashMap<>();
            nativePayload.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));

            List<Map<String, Object>> contents = new ArrayList<>();
            if (history != null) {
                int end = history.size();
                if (end > 0 && "user".equalsIgnoreCase(history.get(end - 1).getSender())) {
                    end--;
                }
                int start = Math.max(0, end - 10);
                for (int i = start; i < end; i++) {
                    Message m = history.get(i);
                    String role = "user".equalsIgnoreCase(m.getSender()) ? "user" : "model";
                    contents.add(Map.of("role", role, "parts", List.of(Map.of("text", m.getContent()))));
                }
            }
            contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", currentContent.toString()))));
            nativePayload.put("contents", contents);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(nativePayload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(geminiNativeUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map responseBody = response.getBody();
                List candidates = (List) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map contentMap = (Map) firstCandidate.get("content");
                    if (contentMap != null) {
                        List parts = (List) contentMap.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map firstPart = (Map) parts.get(0);
                            if (firstPart.get("text") != null) {
                                return (String) firstPart.get("text");
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Native Gemini API failed: " + e.getMessage());
            return "Error calling Gemini API: " + e.getMessage();
        }

        return "Error: Unable to parse response from Gemini API.";
    }


    private String getSystemInstruction(String mode) {
        if (mode == null) mode = "General";

        switch (mode) {
            case "Coding":
                return "You are Sparkle AI Coding Assistant. Provide clean, well-structured code with brief, technical explanations, best practices, and code blocks.";
            case "Study":
                return "You are Sparkle AI Study Companion. Explain complex concepts in simple terms, step-by-step, with relatable examples and clear bullet points.";
            case "Writing":
                return "You are Sparkle AI Professional Writer. Write polished, engaging, well-formatted, grammatically perfect content tailored to the request.";
            case "Document Analysis":
                return "You are Sparkle AI Document Analyst. Summarize documents concisely, extract key takeaways, structural insights, and actionable points.";
            case "Brainstorming":
                return "You are Sparkle AI Brainstorming Partner. Output creative, multi-perspective ideas, categorized logically with out-of-the-box suggestions.";
            default:
                return "You are Sparkle AI, a state-of-the-art intelligent workspace AI assistant. Provide direct, helpful, markdown-formatted responses.";
        }
    }

    private String generateMockResponse(String prompt, String mode, String fileContent, String imageUrl) {
        String lower = prompt.toLowerCase();

        if (imageUrl != null && !imageUrl.isBlank()) {
            return "### 🖼️ Sparkle AI Image Analysis\n\n" +
                   "I have analyzed the provided image (`" + imageUrl + "`).\n\n" +
                   "**Key Observations:**\n" +
                   "- **Visual Layout**: High definition clarity with balanced visual composition.\n" +
                   "- **Content Type**: Digital media asset or user screenshot.\n" +
                   "- **Key Detail**: Contains structured visual information suitable for technical or creative review.\n\n" +
                   "How would you like to build upon this image analysis?";
        }

        if (fileContent != null && !fileContent.isBlank()) {
            return "### 📄 Document Analysis Summary\n\n" +
                   "Based on the attached file, here is the executive overview:\n\n" +
                   "- **Key Topic**: Document analysis for prompt query: *\"" + prompt + "\"*\n" +
                   "- **Content Extract**: " + (fileContent.length() > 200 ? fileContent.substring(0, 200) + "..." : fileContent) + "\n\n" +
                   "#### Essential Highlights:\n" +
                   "1. Structured content parsed successfully.\n" +
                   "2. Ready for deep-dive queries, question generation, or key takeaways extraction.";
        }

        if (lower.contains("code") || lower.contains("java") || lower.contains("python") || lower.contains("javascript") || "Coding".equalsIgnoreCase(mode)) {
            return "Here is a complete solution tailored to your request:\n\n" +
                   "```java\n" +
                   "// Sparkle AI Generated Solution\n" +
                   "public class SparkleAiExample {\n" +
                   "    public static void main(String[] args) {\n" +
                   "        System.out.println(\"Hello from Sparkle AI Workspace!\");\n" +
                   "    }\n" +
                   "}\n" +
                   "```\n\n" +
                   "### Key Features of this implementation:\n" +
                   "- **Modular Structure**: Designed for quick integration and high efficiency.\n" +
                   "- **Best Practices**: Clean naming conventions and memory efficiency.";
        }

        if ("Study".equalsIgnoreCase(mode)) {
            return "### 📚 Concept Explanation\n\n" +
                   "Let's break down **" + prompt + "** step-by-step:\n\n" +
                   "1. **Core Definition**: The fundamental mechanism driving this concept.\n" +
                   "2. **Real-world Analogy**: Think of it like a conductor leading an orchestra.\n" +
                   "3. **Key Takeaway**: Mastering this foundation unlocks deeper technical insight.\n\n" +
                   "Would you like me to generate practice questions on this topic?";
        }

        return "### ✨ Sparkle AI Response\n\n" +
               "Thank you for asking: **\"" + prompt + "\"**.\n\n" +
               "Sparkle AI is operating seamlessly in **" + (mode != null ? mode : "General") + "** mode.\n\n" +
               "- **Context-Aware**: Saved to chat history.\n" +
               "- **Organized**: Integrated with your active workspace.\n\n" +
               "Let me know if you would like me to rewrite, expand, or export this response!";
    }
}

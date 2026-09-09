package com.novaai.service;

import com.novaai.config.FileStorageConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageService {

    @Autowired
    private FileStorageConfig storageConfig;

    public Map<String, String> storeImage(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "image.png";

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Invalid image format. Supported: PNG, JPG, JPEG, WEBP");
        }

        String ext = "";
        int dotIdx = originalName.lastIndexOf(".");
        if (dotIdx > 0) ext = originalName.substring(dotIdx);

        String storedName = UUID.randomUUID().toString() + ext;
        String relativePath = "images/" + storedName;
        Path targetPath = storageConfig.getUploadPath().resolve(relativePath).normalize();

        try {
            if (targetPath.getParent() != null) {
                Files.createDirectories(targetPath.getParent());
            }
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image: " + e.getMessage(), e);
        }

        String imageUrl = "/uploads/" + relativePath;
        return Map.of(
                "originalName", originalName,
                "imageUrl", imageUrl,
                "storedName", storedName
        );
    }
}

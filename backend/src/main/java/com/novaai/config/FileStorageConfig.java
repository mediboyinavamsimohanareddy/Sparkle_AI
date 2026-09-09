package com.novaai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Value("${novaai.upload.dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        try {
            this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.uploadPath);
            Files.createDirectories(this.uploadPath.resolve("images"));
            Files.createDirectories(this.uploadPath.resolve("docs"));
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory: " + e.getMessage(), e);
        }
    }

    public Path getUploadPath() {
        return uploadPath;
    }

    public String getUploadDir() {
        return uploadPath.toString();
    }
}

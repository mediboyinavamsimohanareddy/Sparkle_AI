package com.novaai.service;

import com.novaai.config.FileStorageConfig;
import com.novaai.dto.FileResponse;
import com.novaai.entity.UploadedFile;
import com.novaai.repository.FileRepository;
import com.novaai.util.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private FileStorageConfig storageConfig;

    public FileResponse storeFile(MultipartFile file, Long folderId, Long workspaceId) {
        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "unnamed_file";

        String ext = "";
        int dotIdx = originalName.lastIndexOf(".");
        if (dotIdx > 0) {
            ext = originalName.substring(dotIdx);
        }

        String storedName = UUID.randomUUID().toString() + ext;
        String relativePath = "docs/" + storedName;
        Path targetPath = storageConfig.getUploadPath().resolve(relativePath).normalize();

        try {
            if (targetPath.getParent() != null) {
                Files.createDirectories(targetPath.getParent());
            }
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        String extractedText = FileUtils.extractText(file);

        UploadedFile entity = new UploadedFile();
        entity.setOriginalName(originalName);
        entity.setStoredName(storedName);
        entity.setFilePath(relativePath);
        entity.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        entity.setFileSize(file.getSize());
        entity.setExtractedText(extractedText);
        entity.setFolderId(folderId);
        entity.setWorkspaceId(workspaceId);

        UploadedFile saved = fileRepository.save(entity);
        return mapToResponse(saved);
    }

    public List<FileResponse> getAllFiles(Long workspaceId, Long folderId) {
        List<UploadedFile> list;
        if (folderId != null) {
            list = fileRepository.findByFolderId(folderId);
        } else if (workspaceId != null) {
            list = fileRepository.findByWorkspaceId(workspaceId);
        } else {
            list = fileRepository.findAll();
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public FileResponse getFile(Long id) {
        UploadedFile f = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with ID: " + id));
        return mapToResponse(f);
    }

    public void deleteFile(Long id) {
        UploadedFile f = fileRepository.findById(id).orElse(null);
        if (f != null) {
            Path targetPath = storageConfig.getUploadPath().resolve(f.getFilePath()).normalize();
            try {
                Files.deleteIfExists(targetPath);
            } catch (IOException ignored) {}
            fileRepository.deleteById(id);
        }
    }

    private FileResponse mapToResponse(UploadedFile f) {
        FileResponse dto = new FileResponse();
        dto.setId(f.getId());
        dto.setOriginalName(f.getOriginalName());
        dto.setFileType(f.getFileType());
        dto.setFileSize(f.getFileSize());
        dto.setDownloadUrl("/uploads/" + f.getFilePath());
        dto.setExtractedText(f.getExtractedText());
        dto.setFolderId(f.getFolderId());
        dto.setWorkspaceId(f.getWorkspaceId());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }
}

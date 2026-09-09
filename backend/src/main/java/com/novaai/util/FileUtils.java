package com.novaai.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.ss.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class FileUtils {

    public static String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) return "";

        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();

        try (InputStream inputStream = file.getInputStream()) {
            switch (ext) {
                case "pdf":
                    try (PDDocument document = PDDocument.load(inputStream)) {
                        PDFTextStripper stripper = new PDFTextStripper();
                        return stripper.getText(document);
                    }
                case "docx":
                    try (XWPFDocument doc = new XWPFDocument(inputStream)) {
                        StringBuilder sb = new StringBuilder();
                        List<XWPFParagraph> paragraphs = doc.getParagraphs();
                        for (XWPFParagraph p : paragraphs) {
                            sb.append(p.getText()).append("\n");
                        }
                        return sb.toString();
                    }
                case "xlsx":
                case "xls":
                    try (Workbook workbook = WorkbookFactory.create(inputStream)) {
                        StringBuilder sb = new StringBuilder();
                        for (Sheet sheet : workbook) {
                            sb.append("Sheet: ").append(sheet.getSheetName()).append("\n");
                            for (Row row : sheet) {
                                for (Cell cell : row) {
                                    sb.append(cell.toString()).append("\t");
                                }
                                sb.append("\n");
                            }
                        }
                        return sb.toString();
                    }
                case "txt":
                case "csv":
                case "md":
                case "json":
                case "java":
                case "js":
                case "py":
                    return new String(file.getBytes(), StandardCharsets.UTF_8);
                default:
                    return "Unsupported text extraction format: ." + ext;
            }
        } catch (Exception e) {
            return "Failed to extract text from file: " + e.getMessage();
        }
    }
}

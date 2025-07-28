package com.juaracoding.cksteam26ui.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.juaracoding.cksteam26ui.dto.RespDocumentDTO;
import com.juaracoding.cksteam26ui.httpclient.DocumentService;

@Controller
public class HomeController {

  public static class ArchiveItem {
    private String author;
    private String title;
    private String date;

    public ArchiveItem(String author, String title, String date) {
      this.author = author;
      this.title = title;
      this.date = date;
    }

    public String getAuthor() {
      return author;
    }

    public String getTitle() {
      return title;
    }

    public String getDate() {
      return date;
    }
  }

  @Autowired
  private DocumentService documentService;

  @GetMapping("/")
  public String home(Model model) {
    ResponseEntity<Object> responseEntity = documentService.findByColumn(0, "createdAt", "");
    RespDocumentDTO response = convert(responseEntity.getBody());

    List<ArchiveItem> archives = response.getData().getContent().stream()
        .limit(9)
        .map(doc -> new ArchiveItem("System", doc.getTitle(), doc.getCreatedAt().substring(0, 10)))
        .collect(Collectors.toList());

    model.addAttribute("archives", archives);
    return "home";
  }

  private RespDocumentDTO convert(Object body) {
    return new ObjectMapper().convertValue(body, RespDocumentDTO.class);
  }
}

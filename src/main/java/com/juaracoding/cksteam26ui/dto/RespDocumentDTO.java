package com.juaracoding.cksteam26ui.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RespDocumentDTO {
  private String message;
  private Data data;

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public Data getData() {
    return data;
  }

  public void setData(Data data) {
    this.data = data;
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class Data {
    private List<DocumentContent> content;

    public List<DocumentContent> getContent() {
      return content;
    }

    public void setContent(List<DocumentContent> content) {
      this.content = content;
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class DocumentContent {
    private String title;
    private String createdAt;

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public String getCreatedAt() {
      return createdAt;
    }

    public void setCreatedAt(String createdAt) {
      this.createdAt = createdAt;
    }
  }
}

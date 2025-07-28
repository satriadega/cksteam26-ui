package com.juaracoding.cksteam26ui.httpclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "document-service", url = "${host.rest.api}/document")
public interface DocumentService {
  @GetMapping("/desc/title/{page}")
  ResponseEntity<Object> findByColumn(
      @PathVariable("page") int page,
      @RequestParam("column") String column,
      @RequestParam("value") String value);
}

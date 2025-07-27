package com.juaracoding.cksteam26ui.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

  public static class ArchiveItem {
    public String author;
    public String title;
    public String date;

    public ArchiveItem(String author, String title, String date) {
      this.author = author;
      this.title = title;
      this.date = date;
    }
  }

  @GetMapping("/")
  public String home(Model model) {
    List<ArchiveItem> archives = List.of(
        new ArchiveItem("Kevin Wahyudi",
            "On the Unseen Cost of Disease: What Chronic Illness Teaches Us About Leading with Compassion", "July 4"),
        new ArchiveItem("Kevin Wahyudi",
            "On the Unseen Cost of Disease: What Chronic Illness Teaches Us About Leading with Compassion", "July 4"),
        new ArchiveItem("Kevin Wahyudi",
            "On the Unseen Cost of Disease: What Chronic Illness Teaches Us About Leading with Compassion", "July 4"));
    model.addAttribute("archives", archives);
    return "home";
  }
}

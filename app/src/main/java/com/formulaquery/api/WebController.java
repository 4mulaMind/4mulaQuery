package com.formulaquery.api; // Bhai, apna sahi package name check kar lena

import org.springframework.stereotype.Controller; // Page serve karne ke liye @Controller chahiye
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
public class WebController {

    // 1. Ye function '/' par HTML page load karega
    @GetMapping("/")
    public String index() {
        // Ye automatically 'src/main/resources/static/index.html' ko dhoondega
        return "index.html"; 
    }
}
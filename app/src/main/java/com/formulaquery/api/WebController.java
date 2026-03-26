package com.formulaquery.api; 

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {

        // Jab user root URL "/" open karega to ye method call hoga

        // "forward:" use kar rahe hain taaki Spring Boot directly
        // static folder ke andar index.html file serve kare

        // Ye file path hota hai:
        // src/main/resources/static/index.html

        // Isse template engine (Thymeleaf etc.) use nahi hota
        // aur simple static HTML load ho jata hai

        return "forward:/index.html";
    }
}
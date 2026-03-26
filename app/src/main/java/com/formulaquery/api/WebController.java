package com.formulaquery.api; 

// Spring MVC Controller jo frontend HTML page serve karega
// Is controller ka kaam browser ko index.html return karna hai

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
// @Controller annotation batata hai ki ye class web request handle karegi
public class WebController {

    // Ye method root URL "/" par call hoga
    // Jab koi browser mein http://localhost:8080 open karega
    @GetMapping("/")
    public String index() {

        // Ye Spring Boot ko bolta hai ki index.html return karo
        // Spring Boot automatically file ko yahan search karta hai:
        // src/main/resources/static/index.html

        return "index.html";
    }
}
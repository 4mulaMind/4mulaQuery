package com.formulaquery.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/*
    WebController
    ----------------
    Simple HTML page ya dashboard endpoints ke liye
*/
@Controller
public class WebController {

    @GetMapping("/")
    public String home() {
        return "index"; // resources/templates/index.html
    }
}
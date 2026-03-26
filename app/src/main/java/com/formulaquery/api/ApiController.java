package com.formulaquery.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/*
    REST API Controller
    ----------------
    Sab API endpoints yahan define honge
*/
@RestController
@RequestMapping("/api")
public class ApiController {

    private final EngineService engineService = new EngineService("./core/4mulaQuery");

    @GetMapping("/insert")
    public String insertData(@RequestParam int id,
                             @RequestParam String name,
                             @RequestParam String email) {
        return engineService.executeCommand("insert," + id + "," + name + "," + email);
    }

    @GetMapping("/all")
    public String getAllData() {
        return engineService.executeCommand("all,");
    }

    @GetMapping("/search")
    public String search(@RequestParam int id) {
        return engineService.executeCommand("search," + id);
    }

    @GetMapping("/delete")
    public String deleteData(@RequestParam int id) {
        return engineService.executeCommand("delete," + id + ",");
    }
}
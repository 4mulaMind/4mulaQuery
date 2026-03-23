package src.main.java.com.formulaquery;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String home() {
        return "🚀 4mulaQuery Engine is Live and Running!";
    }
}
package com.simon.armas_springboot_api.mailing;

import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Setter
@Getter
public abstract class AbstractEmailContext {

    private String from;
    private String to;
    private String subject;
    private String email;
    private String templateLocation;
    private Map<String, Object> context;

    public AbstractEmailContext(){
        this.context = new HashMap<>();
    }

    public <T> void init(T context) {
        //we can do any common configuration setup here
        // like setting up some base URL and context
    }

    public Object put(String key, Object value) {
        return key == null? null: this.context.put(key.intern(), value);
    }

     // Getter and Setter for from
    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    // Getter and Setter for to
    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    // Getter and Setter for subject
    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    // Getter and Setter for email
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Getter and Setter for templateLocation
    public String getTemplateLocation() {
        return templateLocation;
    }

    public void setTemplateLocation(String templateLocation) {
        this.templateLocation = templateLocation;
    }

    // Getter and Setter for context
    public Map<String, Object> getContext() {
        return context;
    }

    public void setContext(Map<String, Object> context) {
        this.context = context;
    }

}

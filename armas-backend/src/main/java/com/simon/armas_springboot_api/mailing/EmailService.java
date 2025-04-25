package com.simon.armas_springboot_api.mailing;


import jakarta.mail.MessagingException;

public interface EmailService {
    public  void sendMail(final  AbstractEmailContext emailContext) throws MessagingException;
}

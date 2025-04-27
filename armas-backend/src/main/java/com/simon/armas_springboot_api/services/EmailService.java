// package com.simon.armas_springboot_api.services;

// import jakarta.mail.MessagingException;
// import jakarta.mail.internet.MimeMessage;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.mail.javamail.MimeMessageHelper;
// import org.springframework.scheduling.annotation.Async;
// import org.springframework.stereotype.Service;

// @Service
// public class EmailService {

//     @Autowired
//     private JavaMailSender mailSender;

//     @Async
//     public void sendEmail(SimpleMailMessage email) {
//         mailSender.send(email);
//     }

//     // Notification to Archiver user email when file is successfully uploaded to system
//     public void sendEmail(String recipientEmail, String subject, String body) throws MessagingException {
//         MimeMessage message = mailSender.createMimeMessage();
//         MimeMessageHelper helper = new MimeMessageHelper(message, true);

//         helper.setFrom("mofdevteam@gmail.com", "IRMS");
//         helper.setTo(recipientEmail);
//         helper.setSubject(subject);
//         helper.setText(body, true);

//         mailSender.send(message);
//     }
// }
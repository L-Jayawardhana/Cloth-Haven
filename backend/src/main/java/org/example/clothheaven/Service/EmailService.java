package org.example.clothheaven.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset - Cloth Haven");
        message.setText(
                "Hello,\n\n" +
                        "You requested a password reset for your Cloth Haven account.\n\n" +
                        "Your verification code is: " + resetToken + "\n\n" +
                        "This code will expire in 1 hour.\n\n" +
                        "If you didn't request this, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "Cloth Haven Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't expose email sending issues to user
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}

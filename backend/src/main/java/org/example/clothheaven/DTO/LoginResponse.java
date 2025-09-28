package org.example.clothheaven.DTO;

import java.time.LocalDateTime;

public class LoginResponse {
    private Long userid;
    private String username;
    private String email;
    private String phoneNo;
    private String address;
    private String role;
    private LocalDateTime createdAt;
    private String token;
    private String redirectUrl;
    
    public LoginResponse() {}
    
    public LoginResponse(Long userid, String username, String email, String phoneNo, String address, String role, LocalDateTime createdAt, String token, String redirectUrl) {
        this.userid = userid;
        this.username = username;
        this.email = email;
        this.phoneNo = phoneNo;
        this.address = address;
        this.role = role;
        this.createdAt = createdAt;
        this.token = token;
        this.redirectUrl = redirectUrl;
    }
    
    public Long getUserid() {
        return userid;
    }
    
    public void setUserid(Long userid) {
        this.userid = userid;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getPhoneNo() {
        return phoneNo;
    }
    
    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRedirectUrl() {
        return redirectUrl;
    }
    
    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }
    
    // Builder pattern methods
    public static LoginResponseBuilder builder() {
        return new LoginResponseBuilder();
    }
    
    public static class LoginResponseBuilder {
        private Long userid;
        private String username;
        private String email;
        private String phoneNo;
        private String address;
        private String role;
        private LocalDateTime createdAt;
        private String token;
        private String redirectUrl;
        
        public LoginResponseBuilder userid(Long userid) {
            this.userid = userid;
            return this;
        }
        
        public LoginResponseBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public LoginResponseBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public LoginResponseBuilder phoneNo(String phoneNo) {
            this.phoneNo = phoneNo;
            return this;
        }
        
        public LoginResponseBuilder address(String address) {
            this.address = address;
            return this;
        }
        
        public LoginResponseBuilder role(String role) {
            this.role = role;
            return this;
        }
        
        public LoginResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public LoginResponseBuilder token(String token) {
            this.token = token;
            return this;
        }
        
        public LoginResponseBuilder redirectUrl(String redirectUrl) {
            this.redirectUrl = redirectUrl;
            return this;
        }
        
        public LoginResponse build() {
            return new LoginResponse(userid, username, email, phoneNo, address, role, createdAt, token, redirectUrl);
        }
    }
}
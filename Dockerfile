# Use Ubuntu-based JDK image so we can easily install MySQL
FROM eclipse-temurin:17-jdk-jammy

# 1. Install MySQL Server
RUN apt-get update && \
    apt-get install -y mysql-server && \
    rm -rf /var/lib/apt/lists/*

# 2. Configure MySQL
# Allow specific settings if needed (bind-address is usually loopback by default which is fine here)
RUN mkdir -p /var/run/mysqld && chown mysql:mysql /var/run/mysqld

# 3. Set Working Directory
WORKDIR /app

# 4. Copy the built JAR file from the backend folder
# (Assumes you run the build script below)
COPY backend/target/*.jar app.jar

# 5. Copy the startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# 6. Set Environment Variables for Spring Boot
# These tell Spring Boot to look at "localhost" inside the container
ENV DB_URL=jdbc:mysql://localhost:3306/cloth_heaven?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
ENV DB_USERNAME=clothuser
ENV DB_PASSWORD=clothpass

# 7. Expose Ports
# 8080 for the App, 3306 if you want to access DB externally
EXPOSE 8080 3306

# 8. Run the startup script
ENTRYPOINT ["/start.sh"]
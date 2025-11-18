#!/bin/sh
# Wrapper start script for Railway — forwards to backend/start.sh
if [ -f "./backend/start.sh" ]; then
  # ensure backend start script is executable and run it
  chmod +x ./backend/start.sh 2>/dev/null || true
  exec sh ./backend/start.sh
else
  echo "Error: ./backend/start.sh not found"
  exit 1
fi
#!/bin/bash

# 1. Start MySQL Server
echo "Starting MySQL..."
service mysql start

# 2. Wait for MySQL to wake up
echo "Waiting for MySQL to initialize..."
until mysqladmin ping >/dev/null 2>&1; do
  echo -n "."
  sleep 1
done

# 3. Configure Database & User
DB_NAME=${MYSQL_DATABASE:-cloth_heaven}
DB_USER=${MYSQL_USER:-clothuser}
DB_PASS=${MYSQL_PASSWORD:-clothpass}

echo "--- Configuring Database ---"
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# Create Database
mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Create User and Grant Permissions (Fixes Access Denied)
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'localhost' WITH GRANT OPTION;"
mysql -e "FLUSH PRIVILEGES;"

echo "--- Database Configured ---"

# 4. Start Spring Boot
# We pass the database arguments here to override application.properties
echo "Starting Spring Boot..."
exec java -jar /app/app.jar \
  --spring.datasource.url="jdbc:mysql://localhost:3306/$DB_NAME?useSSL=false&allowPublicKeyRetrieval=true" \
  --spring.datasource.username="$DB_USER" \
  --spring.datasource.password="$DB_PASS"
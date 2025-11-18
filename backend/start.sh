#!/bin/sh
./mvnw -DskipTests package
java -jar target/*.jar

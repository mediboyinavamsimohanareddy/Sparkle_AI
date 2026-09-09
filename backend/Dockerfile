# Stage 1: Build stage with Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package application into a standalone runnable JAR
RUN mvn clean package -DskipTests

# Stage 2: Production runtime stage with Java 21 JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads/docs /app/uploads/images

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose default port
EXPOSE 8080

# Environment defaults
ENV PORT=8080

# Run Spring Boot application
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]

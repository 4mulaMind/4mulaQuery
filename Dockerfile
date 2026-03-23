# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /workspace
COPY . .
RUN cd app && mvn clean package -DskipTests spring-boot:repackage

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# g++ install
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

# 1. JAR file copy karo
COPY --from=build /workspace/app/target/*.jar app.jar

# 2. CORE folder copy karo (Ye line missing thi!)
COPY --from=build /workspace/core ./core

# 3. C++ engine ko permission do (Linux/Render ke liye zaroori hai)
RUN chmod +x ./core/4mulaQuery

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
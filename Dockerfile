# Stage 1: Build Java and C++
# 'maven:3.8.4-openjdk-17' ki jagah ye use karo (Debian based)
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /workspace

# Ab apt-get perfect chalega
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

COPY . .

# 1. Java Build
RUN cd app && mvn clean package -DskipTests spring-boot:repackage

# 2. C++ Build
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# Runtime libraries ke liye g++ yahan bhi zaroori hai
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

# JAR copy karo
COPY --from=build /workspace/app/target/*.jar app.jar

# Compiled C++ engine copy karo
COPY --from=build /workspace/core ./core

# Permission set karo
RUN chmod +x ./core/4mulaQuery

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
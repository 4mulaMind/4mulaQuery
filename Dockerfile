# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /workspace

# Poora project (4mulaQuery) copy karo
COPY . .

# FIX 1: 'app' folder ke andar ghus kar maven chalao
RUN cd app && mvn clean package -DskipTests spring-boot:repackage

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# g++ install
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

# FIX 2: Sahi path (/workspace/app/target) se jar uthao
COPY --from=build /workspace/app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
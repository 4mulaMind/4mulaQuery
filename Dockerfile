# Build Stage (Maven + JDK 17)
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Runtime Stage (Ubuntu based image with JDK 17)
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# g++ install karne ke liye (Aapke database engine ke liye zaroori hai)
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

# Build stage se jar file copy karna
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
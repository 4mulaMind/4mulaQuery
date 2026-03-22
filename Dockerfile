# Build Stage
FROM maven:3.8.4-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Runtime Stage (Ubuntu based, jisme g++ chalega)
FROM openjdk:17-jdk-slim
WORKDIR /app

# g++ install karne ka sahi tarika for slim images
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
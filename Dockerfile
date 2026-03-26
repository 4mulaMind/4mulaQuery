# Stage 1: Build Java and C++
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /workspace

# G++ install karna
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

COPY . .

# 1. Java Build - 'app' folder ke andar ja kar build karo
RUN cd app && mvn clean package -DskipTests

# 2. C++ Build - 'core' folder bahar hi hai
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# Runtime dependencies
RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

# JAR copy karo - Path: /workspace/app/target/
COPY --from=build /workspace/app/target/api-1.0.0.jar app.jar

# Engine copy karo
COPY --from=build /workspace/core ./core

# Permissions and DB file creation
RUN chmod +x ./core/4mulaQuery
RUN touch 4mulaQuery.db && chmod 666 4mulaQuery.db

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT:8080}", "-jar", "app.jar"]
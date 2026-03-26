# Stage 1: Build
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /workspace

# G++ install karna build stage mein
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

COPY . .

# Build Java (Dhyan rakhein ki 'app' folder sahi hai)
RUN mvn clean package -DskipTests

# Build C++ Engine
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# Stage 2: Run
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# Runtime dependencies
RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

# Copy artifacts
COPY --from=build /workspace/target/*.jar app.jar
COPY --from=build /workspace/core ./core

# ⭐ FIX 1: Engine ko root directory se access karne ke liye permissions
RUN chmod +x ./core/4mulaQuery

# ⭐ FIX 2: Database file ko manually create karke write permission dena
# Iske bina Render file system block kar deta hai
RUN touch 4mulaQuery.db && chmod 666 4mulaQuery.db

EXPOSE 8080

# ⭐ FIX 3: Java ko file creation ki extra power dena
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
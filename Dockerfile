# =========================================================
# Stage 1: Build Stage
# Java Spring Boot application aur C++ database engine ko compile karega
# =========================================================
FROM maven:3.8.4-openjdk-17-slim AS build

# ---------------------------------------------------------
# Working directory set karna
# Sab build operations yahi honge
# ---------------------------------------------------------
WORKDIR /workspace

# ---------------------------------------------------------
# C++ compiler install karna
# core C++ engine ko compile karne ke liye
# ---------------------------------------------------------
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Project source code copy karna
# app = Java Spring Boot project
# core = C++ engine
# ---------------------------------------------------------
COPY . .

# ---------------------------------------------------------
# Java Build (Maven)
# - app folder me jaake clean package
# - Tests skip kar rahe hain taaki build fast ho
# ---------------------------------------------------------
WORKDIR /workspace/app
RUN mvn clean package -DskipTests

# ---------------------------------------------------------
# C++ Build
# - core folder ke saare .cpp files compile karenge
# - Output binary: core/4mulaQuery
# - -O3 flag: high-performance optimization
# ---------------------------------------------------------
WORKDIR /workspace/core
RUN g++ -O3 *.cpp -o 4mulaQuery

# ---------------------------------------------------------
# Wapas workspace me aana
# ---------------------------------------------------------
WORKDIR /workspace

# =========================================================
# Stage 2: Runtime Stage
# Lightweight container jisme application run karegi
# =========================================================
FROM eclipse-temurin:17-jdk-focal

# ---------------------------------------------------------
# Runtime working directory
# ---------------------------------------------------------
WORKDIR /app

# ---------------------------------------------------------
# Runtime dependencies install karna
# libstdc++6 C++ engine ke liye zaroori hai
# ---------------------------------------------------------
RUN apt-get update && \
    apt-get install -y libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Java JAR copy karna build stage se
# ---------------------------------------------------------
COPY --from=build /workspace/app/target/api-1.0.0.jar app.jar

# ---------------------------------------------------------
# C++ Engine binary copy karna
# ---------------------------------------------------------
COPY --from=build /workspace/core ./core

# ---------------------------------------------------------
# Permissions
# - C++ binary ko executable bana rahe hain
# - Database file create aur read/write permissions set
# ---------------------------------------------------------
RUN chmod +x ./core/4mulaQuery
RUN touch 4mulaQuery.db && chmod 666 4mulaQuery.db

# ---------------------------------------------------------
# Application port
# ---------------------------------------------------------
EXPOSE 8080
ENV PORT=8080

# ---------------------------------------------------------
# Entry point
# - Java application run karne ke liye
# - Security random source aur PORT environment variable support
# ---------------------------------------------------------
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
# ============================================================
# 4mulaQuery - Multi-Stage Docker Configuration
# ============================================================
# Stage 1: Build & Compilation (Maven + G++)
# Stage 2: Optimized Runtime Environment (JDK 17)
# Developed by: Abdul Qadir
# ============================================================

# ------------------------------------------------------------
# STAGE 1: BUILD ENVIRONMENT
# ------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build


# Project Setup: Base workspace
WORKDIR /workspace

# Kernel Dependencies: Installing G++ for C++ Engine
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

# Source Transfer: Copying the entire project
COPY . .

# JAVA COMPILATION
# Building the Spring Boot Bridge
RUN mvn clean package -DskipTests

# C++ KERNEL COMPILATION
# Building the 4mulaQuery Database Engine from 'core' folder
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# ------------------------------------------------------------
# STAGE 2: RUNTIME ENVIRONMENT (Production Ready)
# ------------------------------------------------------------
FROM eclipse-temurin:17-jdk-focal

# Deployment Directory
WORKDIR /app

# Standard C++ Libraries: Required for binary execution
RUN apt-get update && \
    apt-get install -y libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# ASSET TRANSFER: Copying JAR and Binary from Build Stage
# Note: Using wildcard *.jar to avoid version mismatch errors
COPY --from=build /workspace/target/*.jar app.jar
COPY --from=build /workspace/core/4mulaQuery ./core/4mulaQuery

# SYSTEM PERMISSIONS & INITIALIZATION
RUN chmod +x ./core/4mulaQuery && \
    touch 4mulaQuery.db && \
    chmod 666 4mulaQuery.db

# NETWORKING & EXECUTION
EXPOSE 8080
ENV PORT=8080

# ENTRYPOINT: Using shell mode to ensure ENV variable expansion
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
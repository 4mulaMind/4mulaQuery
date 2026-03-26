# ============================================================
# 4mulaQuery - Final Hybrid Docker Configuration
# ============================================================
# Project: 4mulaQuery Database Engine
# Author: Abdul Qadir
# ============================================================

# ------------------------------------------------------------
# STAGE 1: BUILD ENVIRONMENT (Ubuntu-based for G++)
# ------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /workspace

# Kernel Dependencies: Installing G++ (Ubuntu/Debian Style)
RUN apt-get update && \
    apt-get install -y g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

# Source Transfer
COPY . .

# JAVA COMPILATION
RUN mvn clean package -DskipTests

# C++ KERNEL COMPILATION
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# ------------------------------------------------------------
# STAGE 2: RUNTIME ENVIRONMENT (Production Ready)
# ------------------------------------------------------------
FROM eclipse-temurin:17-jdk-focal

WORKDIR /app

# Standard C++ Libraries
RUN apt-get update && \
    apt-get install -y libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# ASSET TRANSFER: Copying JAR and Binary
COPY --from=build /workspace/target/*.jar app.jar
COPY --from=build /workspace/core/4mulaQuery ./core/4mulaQuery

# SYSTEM PERMISSIONS
RUN chmod +x ./core/4mulaQuery && \
    touch 4mulaQuery.db && \
    chmod 666 4mulaQuery.db

# NETWORKING
EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
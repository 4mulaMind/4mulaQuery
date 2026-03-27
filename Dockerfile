# =============================================================
# STAGE 1: BUILD ENVIRONMENT
# - Maven + JDK for Spring Boot
# - G++ for C++ database engine
# =============================================================
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Working directory
WORKDIR /workspace

# Install G++ and build essentials
RUN apt-get update && \
    apt-get install -y g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy the entire project into container
COPY . .

# -------------------------------
# Java Build
# -------------------------------
# Maven build with pom.xml inside 'app' folder
RUN mvn -f app/pom.xml clean package -DskipTests

# -------------------------------
# C++ Engine Build
# -------------------------------
# Compile all .cpp files inside 'core' folder
# Output binary: core/4mulaQuery
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# =============================================================
# STAGE 2: RUNTIME ENVIRONMENT
# - Lightweight JDK container to run app
# =============================================================
FROM eclipse-temurin:17-jdk-focal

# Working directory inside runtime container
WORKDIR /app

# Install runtime dependencies for C++ engine
RUN apt-get update && \
    apt-get install -y libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# -------------------------------
# Copy built artifacts from build stage
# -------------------------------
COPY --from=build /workspace/app/target/*.jar app.jar
COPY --from=build /workspace/core/4mulaQuery ./core/4mulaQuery

# -------------------------------
# Permissions
# - Make C++ binary executable
# - Core folder read/write permissions for database files
# -------------------------------
# Purana logic:
# RUN chmod +x ./core/4mulaQuery && touch 4mulaQuery.db && chmod 666 4mulaQuery.db
RUN mkdir -p data && \
    chmod +x ./core/4mulaQuery && \
    touch data/4mulaQuery.db && \
    chmod -R 777 data

# Expose Spring Boot default port
EXPOSE 8080
ENV PORT=8080

# -------------------------------
# Entry point
# - Run Spring Boot app
# - java.security.egd for faster startup
# -------------------------------
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
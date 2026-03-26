# Stage 1: Build Java and C++
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /workspace

# Install G++ 
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

COPY . .

# ⭐ FIX: Find the directory containing pom.xml and build there
RUN POM_DIR=$(find . -name "pom.xml" -exec dirname {} \;) && \
    cd $POM_DIR && mvn clean package -DskipTests

# 2. C++ Build (Core folder check)
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# Runtime libraries
RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

# ⭐ FIX: Find and copy the generated JAR no matter where it is
COPY --from=build /workspace/**/target/*.jar app.jar
COPY --from=build /workspace/core ./core

# Permissions for Render
RUN chmod +x ./core/4mulaQuery
RUN touch 4mulaQuery.db && chmod 666 4mulaQuery.db

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
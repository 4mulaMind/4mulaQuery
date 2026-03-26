# Stage 1: Build Java and C++
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /workspace

# Install G++ 
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

# Copy full project
COPY . .

# 1. Java Build (Double app folder path fix)
# Screenshot ke hisaab se pom.xml 'app/app/' ke andar hai
RUN cd app/app && mvn clean package -DskipTests

# 2. C++ Build
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# Runtime libraries
RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

# JAR copy karo (Target path bhi update kiya hai)
COPY --from=build /workspace/app/app/target/*.jar app.jar

# Compiled C++ engine copy karo
COPY --from=build /workspace/core ./core

# Permissions for Render
RUN chmod +x ./core/4mulaQuery
RUN touch 4mulaQuery.db && chmod 666 4mulaQuery.db

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY . .
# 'repackage' command ensure karega ki Manifest file (Main-Class) add ho jaye
RUN mvn clean package -DskipTests spring-boot:repackage

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# g++ install (Aapke database engine ke liye zaroori hai)
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

# Maven build se asli executable jar copy karna
# Ye command 'plain' wali jar ko chhod kar asli wali uthayegi
COPY --from=build /app/target/*.jar app.jar
RUN rm -f app-plain.jar 2>/dev/null || true

EXPOSE 8080

# Isse Java ko pata chalega ki app.jar hi chalanu hai
ENTRYPOINT ["java", "-jar", "app.jar"]
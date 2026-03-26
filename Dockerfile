# ------------------------------------------------------------
# STAGE 1: BUILD ENVIRONMENT
# ------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /workspace

# Install G++
RUN apt-get update && \
    apt-get install -y g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

# Pure project ko copy karo
COPY . .

# FIX: Maven ko batana padega ki pom.xml 'app' folder ke andar hai
RUN mvn -f app/pom.xml clean package -DskipTests

# C++ KERNEL COMPILATION
# Aapke screenshot mein 'core' folder bahar hi hai, toh ye sahi chalega
RUN g++ -O3 core/*.cpp -o core/4mulaQuery

# ------------------------------------------------------------
# STAGE 2: RUNTIME ENVIRONMENT
# ------------------------------------------------------------
FROM eclipse-temurin:17-jdk-focal

WORKDIR /app

RUN apt-get update && \
    apt-get install -y libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# FIX: Yahan bhi 'app/target' path use hoga
COPY --from=build /workspace/app/target/*.jar app.jar
COPY --from=build /workspace/core/4mulaQuery ./core/4mulaQuery

RUN chmod +x ./core/4mulaQuery && \
    touch 4mulaQuery.db && \
    chmod 666 4mulaQuery.db

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
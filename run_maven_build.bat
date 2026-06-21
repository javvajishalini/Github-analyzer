@echo off
rem Build the Spring Boot backend using the Maven binary shipped with the project
rem Maven folder remains at %~dp0apache-maven-3.9.9 (not moved)
set "MAVEN_HOME=%~dp0apache-maven-3.9.9"
set "MAVEN_EXE=%MAVEN_HOME%\bin\mvn.cmd"

if not exist "%MAVEN_EXE%" (
    echo Maven executable not found at %MAVEN_EXE%
    exit /b 1
)

pushd backend
"%MAVEN_EXE%" clean package -DskipTests
popd

echo Build finished. Check backend\target for backend-1.0.0.jar

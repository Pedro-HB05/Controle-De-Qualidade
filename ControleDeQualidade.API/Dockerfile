# Estágio de Compilação
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restaura as dependências
COPY ["ControleDeQualidade.API.csproj", "./"]
RUN dotnet restore "ControleDeQualidade.API.csproj"

# Copia o código e compila
COPY . .
RUN dotnet publish "ControleDeQualidade.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio Final de Execução
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ControleDeQualidade.API.dll"]

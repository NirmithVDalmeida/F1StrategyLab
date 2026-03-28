using F1StrategyApi.Configuration;
using F1StrategyApi.Services;
using MongoDB.Driver;

namespace F1StrategyApi.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddF1HttpClients(
        this IServiceCollection services,
        IConfiguration config)
    {
        var opts = config.GetSection(ExternalApiOptions.SectionName)
                         .Get<ExternalApiOptions>() ?? new ExternalApiOptions
        {
            JolpicaBaseUrl = "https://api.jolpi.ca/ergast/",
            OpenF1BaseUrl  = "https://api.openf1.org/v1/",
            WeatherBaseUrl = "https://api.open-meteo.com/v1/"
        };

        services.AddHttpClient("JolpicaClient", c =>
        {
            c.BaseAddress = new Uri(opts.JolpicaBaseUrl);
            c.Timeout     = TimeSpan.FromSeconds(15);
            c.DefaultRequestHeaders.Add("Accept", "application/json");
        }).AddStandardResilienceHandler();

        services.AddHttpClient("OpenF1Client", c =>
        {
            c.BaseAddress = new Uri(opts.OpenF1BaseUrl);
            c.Timeout     = TimeSpan.FromSeconds(25);
            c.DefaultRequestHeaders.Add("Accept", "application/json");
        }).AddStandardResilienceHandler();

        services.AddHttpClient("WeatherClient", c =>
        {
            c.BaseAddress = new Uri(opts.WeatherBaseUrl);
            c.Timeout     = TimeSpan.FromSeconds(10);
            c.DefaultRequestHeaders.Add("Accept", "application/json");
        }).AddStandardResilienceHandler();

        return services;
    }

    public static IServiceCollection AddF1Services(this IServiceCollection services)
    {
        services.AddScoped<IJolpicaService, JolpicaService>();
        services.AddScoped<IOpenF1Service,  OpenF1Service>();
        services.AddScoped<IWeatherService, WeatherService>();
        return services;
    }

    public static IServiceCollection AddMongoDb(
        this IServiceCollection services,
        IConfiguration config)
    {
        var connStr = config["MongoDB:ConnectionString"] ?? "mongodb://localhost:27017";
        var dbName  = config["MongoDB:DatabaseName"]     ?? "f1strategylab";

        // Register a singleton MongoClient (thread-safe, connection-pooled)
        services.AddSingleton<IMongoClient>(_ => new MongoClient(connStr));

        // Register the database instance
        services.AddSingleton<IMongoDatabase>(sp =>
            sp.GetRequiredService<IMongoClient>().GetDatabase(dbName));

        // Register the setup service
        services.AddScoped<ISetupService, SetupService>();

        return services;
    }
}

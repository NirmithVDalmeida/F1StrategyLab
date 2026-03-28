using System.Text.Json.Nodes;
using F1StrategyApi.Models.Strategy;
using Microsoft.Extensions.Caching.Memory;

namespace F1StrategyApi.Services;

public class WeatherService : IWeatherService
{
    private readonly HttpClient   _http;
    private readonly IMemoryCache _cache;
    private readonly ILogger<WeatherService> _logger;

    public WeatherService(IHttpClientFactory factory, IMemoryCache cache, ILogger<WeatherService> logger)
    {
        _http   = factory.CreateClient("WeatherClient");
        _cache  = cache;
        _logger = logger;
    }

    public async Task<WeatherForecastDto> GetForecastAsync(double latitude, double longitude, DateOnly raceDate)
    {
        var key = $"weather:{latitude:F2}:{longitude:F2}:{raceDate}";
        if (_cache.TryGetValue(key, out WeatherForecastDto? cached)) return cached!;

        try
        {
            var dateStr  = raceDate.ToString("yyyy-MM-dd");
            var url = $"forecast?latitude={latitude}&longitude={longitude}" +
                      $"&daily=precipitation_probability_max,temperature_2m_max,wind_speed_10m_max" +
                      $"&start_date={dateStr}&end_date={dateStr}&timezone=UTC";

            var json = await _http.GetStringAsync(url);
            var node = JsonNode.Parse(json);
            var daily = node?["daily"];

            double? rainProb = daily?["precipitation_probability_max"]?.AsArray().FirstOrDefault()?.GetValue<double?>();
            double? tempMax  = daily?["temperature_2m_max"]?.AsArray().FirstOrDefault()?.GetValue<double?>();
            double? windMax  = daily?["wind_speed_10m_max"]?.AsArray().FirstOrDefault()?.GetValue<double?>();

            var condition = rainProb switch
            {
                >= 60 => "Rain",
                >= 30 => "Possible Rain",
                _     => "Dry"
            };

            var forecast = new WeatherForecastDto(
                RaceDate:          dateStr,
                RainProbabilityMax: rainProb,
                TemperatureMax:    tempMax,
                WindSpeedMax:      windMax,
                Condition:         condition
            );

            _cache.Set(key, forecast, TimeSpan.FromMinutes(5));
            return forecast;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Weather forecast unavailable for {Lat},{Lon} on {Date}", latitude, longitude, raceDate);
            return new WeatherForecastDto(
                RaceDate: raceDate.ToString("yyyy-MM-dd"),
                RainProbabilityMax: null,
                TemperatureMax: null,
                WindSpeedMax: null,
                Condition: "Unknown"
            );
        }
    }
}

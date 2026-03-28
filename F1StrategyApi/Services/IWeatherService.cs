using F1StrategyApi.Models.Strategy;

namespace F1StrategyApi.Services;

public interface IWeatherService
{
    Task<WeatherForecastDto> GetForecastAsync(double latitude, double longitude, DateOnly raceDate);
}

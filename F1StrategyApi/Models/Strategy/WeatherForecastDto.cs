namespace F1StrategyApi.Models.Strategy;

public record WeatherForecastDto(
    string RaceDate,
    double? RainProbabilityMax,
    double? TemperatureMax,
    double? WindSpeedMax,
    string  Condition  // "Dry" | "Possible Rain" | "Rain"
);

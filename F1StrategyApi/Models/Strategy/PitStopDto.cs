namespace F1StrategyApi.Models.Strategy;

public record PitStopDto(
    int    Round,
    string DriverId,
    int    Stop,
    int    Lap,
    string Time,
    string Duration
);

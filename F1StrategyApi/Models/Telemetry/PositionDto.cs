namespace F1StrategyApi.Models.Telemetry;

public record PositionDto(
    int    SessionKey,
    int    DriverNumber,
    string Date,
    double X,
    double Y,
    double Z
);

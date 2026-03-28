namespace F1StrategyApi.Models.Telemetry;

public record CarDataDto(
    int     SessionKey,
    int     DriverNumber,
    string  Date,
    int     Speed,
    int     Throttle,
    int     Brake,
    int     Drs,
    int     Gear,
    int     Rpm,
    double? NeutralGearFraction
);

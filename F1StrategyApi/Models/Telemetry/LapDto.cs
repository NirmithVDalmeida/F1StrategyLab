namespace F1StrategyApi.Models.Telemetry;

public record LapDto(
    int     SessionKey,
    int     DriverNumber,
    int     LapNumber,
    double? LapDuration,
    double? DurationSector1,
    double? DurationSector2,
    double? DurationSector3,
    bool?   IsPitOutLap,
    string? Compound
);

namespace F1StrategyApi.Models.Comparison;

public record SessionResultDto(
    int    Round,
    string RaceName,
    string DriverId,
    string ConstructorId,
    int?   Grid,
    int?   Position,
    string? Time,
    int?   Points,
    string? FastestLap
);

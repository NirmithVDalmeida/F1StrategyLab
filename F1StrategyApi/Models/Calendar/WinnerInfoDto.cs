namespace F1StrategyApi.Models.Calendar;

/// <summary>The winning driver of a completed race, with constructor + result detail.</summary>
public record WinnerInfoDto(
    int     Round,
    string  CircuitId,
    string  DriverId,
    string  DriverCode,
    string  GivenName,
    string  FamilyName,
    string  Nationality,
    string  ConstructorId,
    string  ConstructorName,
    string? Time,
    int?    Grid,
    string? FastestLap,
    int?    Points
);

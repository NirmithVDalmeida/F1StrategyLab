namespace F1StrategyApi.Models.Calendar;

public record RaceDto(
    int    Round,
    string RaceName,
    string CircuitId,
    string CircuitName,
    string Location,
    string Country,
    string Date,
    string? Time,
    double Latitude,
    double Longitude,
    SessionScheduleDto? Schedule
);

public record SessionScheduleDto(
    string? Fp1Date,  string? Fp1Time,
    string? Fp2Date,  string? Fp2Time,
    string? Fp3Date,  string? Fp3Time,
    string? QualiDate,string? QualiTime,
    string? RaceDate, string? RaceTime
);

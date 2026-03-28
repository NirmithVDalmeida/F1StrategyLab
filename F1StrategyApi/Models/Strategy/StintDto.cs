namespace F1StrategyApi.Models.Strategy;

public record StintDto(
    int     SessionKey,
    int     MeetingKey,
    int     DriverNumber,
    string  Compound,
    int     LapStart,
    int     LapEnd,
    int?    TyreAgeAtStart,
    bool?   IsFresh
);

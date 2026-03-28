namespace F1StrategyApi.Models.Comparison;

public record ConstructorStandingDto(
    int    Position,
    string ConstructorId,
    string Name,
    string Nationality,
    int    Points,
    int    Wins
);

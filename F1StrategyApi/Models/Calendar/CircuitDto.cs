namespace F1StrategyApi.Models.Calendar;

public record CircuitDto(
    string CircuitId,
    string CircuitName,
    string Locality,
    string Country,
    double Latitude,
    double Longitude,
    string? Url
);

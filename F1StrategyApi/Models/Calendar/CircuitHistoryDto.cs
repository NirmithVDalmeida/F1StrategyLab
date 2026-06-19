namespace F1StrategyApi.Models.Calendar;

/// <summary>A driver's all-time record at a single circuit.</summary>
public record CircuitHistoryDto(
    string    CircuitId,
    string    DriverId,
    int       Starts,
    int       Wins,
    int       Podiums,
    int?      BestFinish,
    List<int> Years
);

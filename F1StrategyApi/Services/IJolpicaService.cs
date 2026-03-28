using F1StrategyApi.Models.Calendar;
using F1StrategyApi.Models.Strategy;
using F1StrategyApi.Models.Comparison;

namespace F1StrategyApi.Services;

public interface IJolpicaService
{
    Task<List<RaceDto>>                  GetRaceCalendarAsync(int season);
    Task<List<CircuitDto>>               GetCircuitsAsync(int season);
    Task<List<PitStopDto>>               GetPitStopsAsync(int season, int round);
    Task<List<ConstructorStandingDto>>   GetConstructorStandingsAsync(int season);
    Task<List<SessionResultDto>>         GetRaceResultsAsync(int season, int round);
}

using F1StrategyApi.Models.Strategy;
using F1StrategyApi.Models.Telemetry;

namespace F1StrategyApi.Services;

public interface IOpenF1Service
{
    Task<List<StintDto>>   GetStintsAsync(int sessionKey, int? driverNumber = null);
    Task<List<CarDataDto>> GetCarDataAsync(int sessionKey, int driverNumber);
    Task<List<PositionDto>> GetPositionsAsync(int sessionKey, int driverNumber);
    Task<List<LapDto>>     GetLapsAsync(int sessionKey, int? driverNumber = null);
}

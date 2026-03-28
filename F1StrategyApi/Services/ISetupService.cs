using F1StrategyApi.Models.Setups;

namespace F1StrategyApi.Services;

public interface ISetupService
{
    // ── Saved Car Setups ────────────────────────────────────────────
    Task<List<SavedSetupDocument>> GetSetupsAsync();
    Task<SavedSetupDocument?>      GetSetupByIdAsync(string id);
    Task<SavedSetupDocument>       CreateSetupAsync(SavedSetupRequest req);
    Task<bool>                     UpdateSetupAsync(string id, SavedSetupRequest req);
    Task<bool>                     DeleteSetupAsync(string id);

    // ── Strategies ──────────────────────────────────────────────────
    Task<List<StrategyDocument>> GetStrategiesAsync();
    Task<StrategyDocument?>      GetStrategyByIdAsync(string id);
    Task<StrategyDocument>       CreateStrategyAsync(StrategyRequest req);
    Task<bool>                   UpdateStrategyAsync(string id, StrategyRequest req);
    Task<bool>                   DeleteStrategyAsync(string id);
}

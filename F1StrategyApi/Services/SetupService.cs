using F1StrategyApi.Models.Setups;
using MongoDB.Driver;

namespace F1StrategyApi.Services;

public class SetupService : ISetupService
{
    private readonly IMongoCollection<SavedSetupDocument> _setups;
    private readonly IMongoCollection<StrategyDocument>   _strategies;

    public SetupService(IMongoDatabase database)
    {
        _setups     = database.GetCollection<SavedSetupDocument>("setups");
        _strategies = database.GetCollection<StrategyDocument>("strategies");
    }

    // ── Setups ──────────────────────────────────────────────────────

    public async Task<List<SavedSetupDocument>> GetSetupsAsync() =>
        await _setups.Find(_ => true)
                     .SortByDescending(s => s.CreatedAt)
                     .ToListAsync();

    public async Task<SavedSetupDocument?> GetSetupByIdAsync(string id) =>
        await _setups.Find(s => s.Id == id).FirstOrDefaultAsync();

    public async Task<SavedSetupDocument> CreateSetupAsync(SavedSetupRequest req)
    {
        var doc = new SavedSetupDocument
        {
            Name   = req.Name,
            Config = req.Config,
        };
        await _setups.InsertOneAsync(doc);
        return doc;
    }

    public async Task<bool> UpdateSetupAsync(string id, SavedSetupRequest req)
    {
        var update = Builders<SavedSetupDocument>.Update
            .Set(s => s.Name,   req.Name)
            .Set(s => s.Config, req.Config);

        var result = await _setups.UpdateOneAsync(s => s.Id == id, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteSetupAsync(string id)
    {
        var result = await _setups.DeleteOneAsync(s => s.Id == id);
        return result.DeletedCount > 0;
    }

    // ── Strategies ──────────────────────────────────────────────────

    public async Task<List<StrategyDocument>> GetStrategiesAsync() =>
        await _strategies.Find(_ => true)
                         .SortByDescending(s => s.CreatedAt)
                         .ToListAsync();

    public async Task<StrategyDocument?> GetStrategyByIdAsync(string id) =>
        await _strategies.Find(s => s.Id == id).FirstOrDefaultAsync();

    public async Task<StrategyDocument> CreateStrategyAsync(StrategyRequest req)
    {
        var doc = new StrategyDocument
        {
            Label  = req.Label,
            Stints = req.Stints,
        };
        await _strategies.InsertOneAsync(doc);
        return doc;
    }

    public async Task<bool> UpdateStrategyAsync(string id, StrategyRequest req)
    {
        var update = Builders<StrategyDocument>.Update
            .Set(s => s.Label,  req.Label)
            .Set(s => s.Stints, req.Stints);

        var result = await _strategies.UpdateOneAsync(s => s.Id == id, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteStrategyAsync(string id)
    {
        var result = await _strategies.DeleteOneAsync(s => s.Id == id);
        return result.DeletedCount > 0;
    }
}

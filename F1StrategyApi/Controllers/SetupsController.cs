using F1StrategyApi.Models.Setups;
using F1StrategyApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace F1StrategyApi.Controllers;

[ApiController]
[Route("api/setups")]
public class SetupsController(ISetupService svc) : ControllerBase
{
    // ═══════════ CAR SETUPS ═══════════

    [HttpGet("configs")]
    public async Task<IActionResult> GetConfigs() =>
        Ok(await svc.GetSetupsAsync());

    [HttpGet("configs/{id}")]
    public async Task<IActionResult> GetConfig(string id)
    {
        var doc = await svc.GetSetupByIdAsync(id);
        return doc is null ? NotFound() : Ok(doc);
    }

    [HttpPost("configs")]
    public async Task<IActionResult> CreateConfig([FromBody] SavedSetupRequest req)
    {
        var doc = await svc.CreateSetupAsync(req);
        return CreatedAtAction(nameof(GetConfig), new { id = doc.Id }, doc);
    }

    [HttpPut("configs/{id}")]
    public async Task<IActionResult> UpdateConfig(string id, [FromBody] SavedSetupRequest req) =>
        await svc.UpdateSetupAsync(id, req) ? NoContent() : NotFound();

    [HttpDelete("configs/{id}")]
    public async Task<IActionResult> DeleteConfig(string id) =>
        await svc.DeleteSetupAsync(id) ? NoContent() : NotFound();

    // ═══════════ STRATEGIES ═══════════

    [HttpGet("strategies")]
    public async Task<IActionResult> GetStrategies() =>
        Ok(await svc.GetStrategiesAsync());

    [HttpGet("strategies/{id}")]
    public async Task<IActionResult> GetStrategy(string id)
    {
        var doc = await svc.GetStrategyByIdAsync(id);
        return doc is null ? NotFound() : Ok(doc);
    }

    [HttpPost("strategies")]
    public async Task<IActionResult> CreateStrategy([FromBody] StrategyRequest req)
    {
        var doc = await svc.CreateStrategyAsync(req);
        return CreatedAtAction(nameof(GetStrategy), new { id = doc.Id }, doc);
    }

    [HttpPut("strategies/{id}")]
    public async Task<IActionResult> UpdateStrategy(string id, [FromBody] StrategyRequest req) =>
        await svc.UpdateStrategyAsync(id, req) ? NoContent() : NotFound();

    [HttpDelete("strategies/{id}")]
    public async Task<IActionResult> DeleteStrategy(string id) =>
        await svc.DeleteStrategyAsync(id) ? NoContent() : NotFound();
}

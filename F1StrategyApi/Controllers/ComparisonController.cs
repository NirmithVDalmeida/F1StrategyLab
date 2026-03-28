using F1StrategyApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace F1StrategyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComparisonController : ControllerBase
{
    private readonly IJolpicaService _jolpica;
    private readonly IOpenF1Service  _openF1;

    public ComparisonController(IJolpicaService jolpica, IOpenF1Service openF1)
    {
        _jolpica = jolpica;
        _openF1  = openF1;
    }

    /// <summary>Constructor championship standings for a season.</summary>
    [HttpGet("standings/{season:int}")]
    public async Task<IActionResult> GetStandings(int season = 2025)
    {
        var standings = await _jolpica.GetConstructorStandingsAsync(season);
        return Ok(standings);
    }

    /// <summary>Race results for a specific round.</summary>
    [HttpGet("results")]
    public async Task<IActionResult> GetResults([FromQuery] int season = 2025, [FromQuery] int round = 1)
    {
        var results = await _jolpica.GetRaceResultsAsync(season, round);
        return Ok(results);
    }

    /// <summary>Lap-by-lap data for multiple drivers in a session for comparison.</summary>
    [HttpGet("telemetry")]
    public async Task<IActionResult> GetTelemetry(
        [FromQuery] int sessionKey,
        [FromQuery] string drivers)
    {
        var driverNumbers = drivers
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(d => int.TryParse(d.Trim(), out var n) ? n : (int?)null)
            .Where(d => d.HasValue)
            .Select(d => d!.Value)
            .Take(2)
            .ToList();

        var tasks = driverNumbers.Select(d => _openF1.GetLapsAsync(sessionKey, d));
        var results = await Task.WhenAll(tasks);

        var response = driverNumbers
            .Zip(results, (driver, laps) => new { driver, laps })
            .ToDictionary(x => x.driver.ToString(), x => x.laps);

        return Ok(response);
    }
}

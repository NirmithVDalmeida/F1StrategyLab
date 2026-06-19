using F1StrategyApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace F1StrategyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarController : ControllerBase
{
    private readonly IJolpicaService _jolpica;
    private readonly ILogger<CalendarController> _logger;

    public CalendarController(IJolpicaService jolpica, ILogger<CalendarController> logger)
    {
        _jolpica = jolpica;
        _logger  = logger;
    }

    /// <summary>Returns the full race calendar for a given season.</summary>
    [HttpGet("races/{season:int}")]
    public async Task<IActionResult> GetRaces(int season = 2026)
    {
        _logger.LogInformation("Fetching race calendar for {Season}", season);
        var races = await _jolpica.GetRaceCalendarAsync(season);
        return Ok(races);
    }

    /// <summary>Returns all circuits for a season.</summary>
    [HttpGet("circuits/{season:int}")]
    public async Task<IActionResult> GetCircuits(int season = 2026)
    {
        var circuits = await _jolpica.GetCircuitsAsync(season);
        return Ok(circuits);
    }

    /// <summary>Returns the winning driver of every completed round in a season.</summary>
    [HttpGet("races/{season:int}/winners")]
    public async Task<IActionResult> GetWinners(int season = 2026)
    {
        var winners = await _jolpica.GetSeasonWinnersAsync(season);
        return Ok(winners);
    }

    /// <summary>Returns a driver's all-time record at a single circuit.</summary>
    [HttpGet("circuits/{circuitId}/drivers/{driverId}/history")]
    public async Task<IActionResult> GetDriverCircuitHistory(string circuitId, string driverId)
    {
        var history = await _jolpica.GetDriverCircuitHistoryAsync(circuitId, driverId);
        return Ok(history);
    }
}

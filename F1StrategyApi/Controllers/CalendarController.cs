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
}

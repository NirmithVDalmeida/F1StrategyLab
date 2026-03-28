using F1StrategyApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace F1StrategyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StrategyController : ControllerBase
{
    private readonly IJolpicaService _jolpica;
    private readonly IOpenF1Service  _openF1;
    private readonly IWeatherService _weather;

    public StrategyController(IJolpicaService jolpica, IOpenF1Service openF1, IWeatherService weather)
    {
        _jolpica = jolpica;
        _openF1  = openF1;
        _weather = weather;
    }

    /// <summary>Historical pit stop data for a given race.</summary>
    [HttpGet("pitstops")]
    public async Task<IActionResult> GetPitStops([FromQuery] int season = 2025, [FromQuery] int round = 1)
    {
        var pitStops = await _jolpica.GetPitStopsAsync(season, round);
        return Ok(pitStops);
    }

    /// <summary>Tyre stint data for an OpenF1 session.</summary>
    [HttpGet("stints")]
    public async Task<IActionResult> GetStints(
        [FromQuery] int sessionKey,
        [FromQuery] int? driverNumber = null)
    {
        var stints = await _openF1.GetStintsAsync(sessionKey, driverNumber);
        return Ok(stints);
    }

    /// <summary>Weather forecast for a race location and date.</summary>
    [HttpGet("weather")]
    public async Task<IActionResult> GetWeather(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] string raceDate)
    {
        if (!DateOnly.TryParse(raceDate, out var date))
            return BadRequest("Invalid raceDate format. Use yyyy-MM-dd.");

        var forecast = await _weather.GetForecastAsync(latitude, longitude, date);
        return Ok(forecast);
    }
}

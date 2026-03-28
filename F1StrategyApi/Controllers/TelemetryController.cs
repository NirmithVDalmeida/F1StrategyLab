using F1StrategyApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace F1StrategyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelemetryController : ControllerBase
{
    private readonly IOpenF1Service _openF1;

    public TelemetryController(IOpenF1Service openF1)
    {
        _openF1 = openF1;
    }

    /// <summary>Car telemetry (speed, throttle, brake, DRS) for a driver in a session.</summary>
    [HttpGet("car")]
    public async Task<IActionResult> GetCarData(
        [FromQuery] int sessionKey,
        [FromQuery] int driverNumber)
    {
        var data = await _openF1.GetCarDataAsync(sessionKey, driverNumber);
        return Ok(data);
    }

    /// <summary>GPS position data for a driver in a session.</summary>
    [HttpGet("position")]
    public async Task<IActionResult> GetPositions(
        [FromQuery] int sessionKey,
        [FromQuery] int driverNumber)
    {
        var data = await _openF1.GetPositionsAsync(sessionKey, driverNumber);
        return Ok(data);
    }

    /// <summary>Lap time data for a session (all drivers or filtered).</summary>
    [HttpGet("laps")]
    public async Task<IActionResult> GetLaps(
        [FromQuery] int sessionKey,
        [FromQuery] int? driverNumber = null)
    {
        var data = await _openF1.GetLapsAsync(sessionKey, driverNumber);
        return Ok(data);
    }
}

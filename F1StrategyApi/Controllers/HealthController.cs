using Microsoft.AspNetCore.Mvc;

namespace F1StrategyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new { status = "healthy", timestamp = DateTime.UtcNow, version = "1.0" });
}

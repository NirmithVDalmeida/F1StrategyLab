using System.Text.Json;
using System.Text.Json.Nodes;
using F1StrategyApi.Models.Strategy;
using F1StrategyApi.Models.Telemetry;
using Microsoft.Extensions.Caching.Memory;

namespace F1StrategyApi.Services;

public class OpenF1Service : IOpenF1Service
{
    private readonly HttpClient   _http;
    private readonly IMemoryCache _cache;
    private readonly ILogger<OpenF1Service> _logger;

    public OpenF1Service(IHttpClientFactory factory, IMemoryCache cache, ILogger<OpenF1Service> logger)
    {
        _http   = factory.CreateClient("OpenF1Client");
        _cache  = cache;
        _logger = logger;
    }

    public async Task<List<StintDto>> GetStintsAsync(int sessionKey, int? driverNumber = null)
    {
        var key = $"openf1:stints:{sessionKey}:{driverNumber}";
        if (_cache.TryGetValue(key, out List<StintDto>? cached)) return cached!;

        try
        {
            var url = $"stints?session_key={sessionKey}";
            if (driverNumber.HasValue) url += $"&driver_number={driverNumber}";

            var json    = await _http.GetStringAsync(url);
            var items   = JsonNode.Parse(json)?.AsArray();
            var results = items?.Select(n => new StintDto(
                SessionKey:     n?["session_key"]?.GetValue<int>() ?? 0,
                MeetingKey:     n?["meeting_key"]?.GetValue<int>() ?? 0,
                DriverNumber:   n?["driver_number"]?.GetValue<int>() ?? 0,
                Compound:       n?["compound"]?.GetValue<string>() ?? "",
                LapStart:       n?["lap_start"]?.GetValue<int>() ?? 0,
                LapEnd:         n?["lap_end"]?.GetValue<int>() ?? 0,
                TyreAgeAtStart: n?["tyre_age_at_start"]?.GetValue<int?>(),
                IsFresh:        n?["is_fresh_tyre"]?.GetValue<bool?>()
            )).ToList() ?? [];

            _cache.Set(key, results, TimeSpan.FromMinutes(10));
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenF1 stints unavailable for session {SessionKey}", sessionKey);
            return [];
        }
    }

    public async Task<List<CarDataDto>> GetCarDataAsync(int sessionKey, int driverNumber)
    {
        var key = $"openf1:cardata:{sessionKey}:{driverNumber}";
        if (_cache.TryGetValue(key, out List<CarDataDto>? cached)) return cached!;

        try
        {
            // Limit to 500 samples to avoid massive payloads — sufficient for visualisation
            var json    = await _http.GetStringAsync($"car_data?session_key={sessionKey}&driver_number={driverNumber}&speed%3E=0");
            var items   = JsonNode.Parse(json)?.AsArray();
            var results = items?.Take(500).Select(n => new CarDataDto(
                SessionKey:          n?["session_key"]?.GetValue<int>() ?? 0,
                DriverNumber:        n?["driver_number"]?.GetValue<int>() ?? 0,
                Date:                n?["date"]?.GetValue<string>() ?? "",
                Speed:               n?["speed"]?.GetValue<int>() ?? 0,
                Throttle:            n?["throttle"]?.GetValue<int>() ?? 0,
                Brake:               n?["brake"]?.GetValue<int>() ?? 0,
                Drs:                 n?["drs"]?.GetValue<int>() ?? 0,
                Gear:                n?["n_gear"]?.GetValue<int>() ?? 0,
                Rpm:                 n?["rpm"]?.GetValue<int>() ?? 0,
                NeutralGearFraction: null
            )).ToList() ?? [];

            _cache.Set(key, results, TimeSpan.FromMinutes(10));
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenF1 car_data unavailable for session {SessionKey} driver {Driver}", sessionKey, driverNumber);
            return [];
        }
    }

    public async Task<List<PositionDto>> GetPositionsAsync(int sessionKey, int driverNumber)
    {
        var key = $"openf1:position:{sessionKey}:{driverNumber}";
        if (_cache.TryGetValue(key, out List<PositionDto>? cached)) return cached!;

        try
        {
            var json    = await _http.GetStringAsync($"location?session_key={sessionKey}&driver_number={driverNumber}");
            var items   = JsonNode.Parse(json)?.AsArray();
            var results = items?.Take(1000).Select(n => new PositionDto(
                SessionKey:   n?["session_key"]?.GetValue<int>() ?? 0,
                DriverNumber: n?["driver_number"]?.GetValue<int>() ?? 0,
                Date:         n?["date"]?.GetValue<string>() ?? "",
                X:            n?["x"]?.GetValue<double>() ?? 0,
                Y:            n?["y"]?.GetValue<double>() ?? 0,
                Z:            n?["z"]?.GetValue<double>() ?? 0
            )).ToList() ?? [];

            _cache.Set(key, results, TimeSpan.FromMinutes(10));
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenF1 location unavailable for session {SessionKey}", sessionKey);
            return [];
        }
    }

    public async Task<List<LapDto>> GetLapsAsync(int sessionKey, int? driverNumber = null)
    {
        var key = $"openf1:laps:{sessionKey}:{driverNumber}";
        if (_cache.TryGetValue(key, out List<LapDto>? cached)) return cached!;

        try
        {
            var url = $"laps?session_key={sessionKey}";
            if (driverNumber.HasValue) url += $"&driver_number={driverNumber}";

            var json    = await _http.GetStringAsync(url);
            var items   = JsonNode.Parse(json)?.AsArray();
            var results = items?.Select(n => new LapDto(
                SessionKey:      n?["session_key"]?.GetValue<int>() ?? 0,
                DriverNumber:    n?["driver_number"]?.GetValue<int>() ?? 0,
                LapNumber:       n?["lap_number"]?.GetValue<int>() ?? 0,
                LapDuration:     TryGetDouble(n, "lap_duration"),
                DurationSector1: TryGetDouble(n, "duration_sector_1"),
                DurationSector2: TryGetDouble(n, "duration_sector_2"),
                DurationSector3: TryGetDouble(n, "duration_sector_3"),
                IsPitOutLap:     n?["is_pit_out_lap"]?.GetValue<bool?>(),
                Compound:        null
            )).ToList() ?? [];

            _cache.Set(key, results, TimeSpan.FromMinutes(10));
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenF1 laps unavailable for session {SessionKey}", sessionKey);
            return [];
        }
    }

    private static double? TryGetDouble(JsonNode? node, string key)
    {
        try { return node?[key]?.GetValue<double>(); }
        catch { return null; }
    }
}

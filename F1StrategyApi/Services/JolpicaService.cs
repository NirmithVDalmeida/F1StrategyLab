using System.Text.Json;
using System.Text.Json.Nodes;
using F1StrategyApi.Models.Calendar;
using F1StrategyApi.Models.Comparison;
using F1StrategyApi.Models.Strategy;
using Microsoft.Extensions.Caching.Memory;

namespace F1StrategyApi.Services;

public class JolpicaService : IJolpicaService
{
    private readonly HttpClient  _http;
    private readonly IMemoryCache _cache;
    private readonly ILogger<JolpicaService> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public JolpicaService(IHttpClientFactory factory, IMemoryCache cache, ILogger<JolpicaService> logger)
    {
        _http   = factory.CreateClient("JolpicaClient");
        _cache  = cache;
        _logger = logger;
    }

    // ── Race Calendar ─────────────────────────────────────────────────────────

    public async Task<List<RaceDto>> GetRaceCalendarAsync(int season)
    {
        var key = $"jolpica:calendar:{season}";
        if (_cache.TryGetValue(key, out List<RaceDto>? cached)) return cached!;

        try
        {
            var json = await _http.GetStringAsync($"f1/{season}.json?limit=30");
            var races = ParseRaces(json);
            _cache.Set(key, races, TimeSpan.FromHours(24));
            return races;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch calendar for season {Season}", season);
            return [];
        }
    }

    public async Task<List<CircuitDto>> GetCircuitsAsync(int season)
    {
        var key = $"jolpica:circuits:{season}";
        if (_cache.TryGetValue(key, out List<CircuitDto>? cached)) return cached!;

        try
        {
            var json = await _http.GetStringAsync($"f1/{season}/circuits.json?limit=30");
            var circuits = ParseCircuits(json);
            _cache.Set(key, circuits, TimeSpan.FromHours(24));
            return circuits;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch circuits for season {Season}", season);
            return [];
        }
    }

    public async Task<List<PitStopDto>> GetPitStopsAsync(int season, int round)
    {
        var key = $"jolpica:pitstops:{season}:{round}";
        if (_cache.TryGetValue(key, out List<PitStopDto>? cached)) return cached!;

        try
        {
            var json = await _http.GetStringAsync($"f1/{season}/{round}/pitstops.json?limit=100");
            var pitStops = ParsePitStops(json, round);
            _cache.Set(key, pitStops, TimeSpan.FromMinutes(30));
            return pitStops;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch pit stops for season {Season} round {Round}", season, round);
            return [];
        }
    }

    public async Task<List<ConstructorStandingDto>> GetConstructorStandingsAsync(int season)
    {
        var key = $"jolpica:constructors:{season}";
        if (_cache.TryGetValue(key, out List<ConstructorStandingDto>? cached)) return cached!;

        try
        {
            var json = await _http.GetStringAsync($"f1/{season}/constructorStandings.json");
            var standings = ParseConstructorStandings(json);
            _cache.Set(key, standings, TimeSpan.FromMinutes(15));
            return standings;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch constructor standings for season {Season}", season);
            return [];
        }
    }

    public async Task<List<SessionResultDto>> GetRaceResultsAsync(int season, int round)
    {
        var key = $"jolpica:results:{season}:{round}";
        if (_cache.TryGetValue(key, out List<SessionResultDto>? cached)) return cached!;

        try
        {
            var json = await _http.GetStringAsync($"f1/{season}/{round}/results.json?limit=30");
            var results = ParseRaceResults(json);
            _cache.Set(key, results, TimeSpan.FromMinutes(30));
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch results for season {Season} round {Round}", season, round);
            return [];
        }
    }

    // ── Private Parsers ───────────────────────────────────────────────────────

    private static List<RaceDto> ParseRaces(string json)
    {
        var result = new List<RaceDto>();
        try
        {
            var node  = JsonNode.Parse(json);
            var races = node?["MRData"]?["RaceTable"]?["Races"]?.AsArray();
            if (races == null) return result;

            foreach (var race in races)
            {
                if (race == null) continue;
                var circuit = race["Circuit"];
                var loc     = circuit?["Location"];

                double.TryParse(loc?["lat"]?.GetValue<string>(),  out var lat);
                double.TryParse(loc?["long"]?.GetValue<string>(), out var lng);

                result.Add(new RaceDto(
                    Round:       int.TryParse(race["round"]?.GetValue<string>(), out var r) ? r : 0,
                    RaceName:    race["raceName"]?.GetValue<string>() ?? "",
                    CircuitId:   circuit?["circuitId"]?.GetValue<string>() ?? "",
                    CircuitName: circuit?["circuitName"]?.GetValue<string>() ?? "",
                    Location:    loc?["locality"]?.GetValue<string>() ?? "",
                    Country:     loc?["country"]?.GetValue<string>() ?? "",
                    Date:        race["date"]?.GetValue<string>() ?? "",
                    Time:        race["time"]?.GetValue<string>(),
                    Latitude:    lat,
                    Longitude:   lng,
                    Schedule: ParseSchedule(race)
                ));
            }
        }
        catch { /* return whatever was parsed */ }
        return result;
    }

    private static SessionScheduleDto? ParseSchedule(JsonNode? race)
    {
        if (race == null) return null;
        return new SessionScheduleDto(
            Fp1Date:   race["FirstPractice"]?["date"]?.GetValue<string>(),
            Fp1Time:   race["FirstPractice"]?["time"]?.GetValue<string>(),
            Fp2Date:   race["SecondPractice"]?["date"]?.GetValue<string>(),
            Fp2Time:   race["SecondPractice"]?["time"]?.GetValue<string>(),
            Fp3Date:   race["ThirdPractice"]?["date"]?.GetValue<string>(),
            Fp3Time:   race["ThirdPractice"]?["time"]?.GetValue<string>(),
            QualiDate: race["Qualifying"]?["date"]?.GetValue<string>(),
            QualiTime: race["Qualifying"]?["time"]?.GetValue<string>(),
            RaceDate:  race["date"]?.GetValue<string>(),
            RaceTime:  race["time"]?.GetValue<string>()
        );
    }

    private static List<CircuitDto> ParseCircuits(string json)
    {
        var result = new List<CircuitDto>();
        try
        {
            var node     = JsonNode.Parse(json);
            var circuits = node?["MRData"]?["CircuitTable"]?["Circuits"]?.AsArray();
            if (circuits == null) return result;

            foreach (var c in circuits)
            {
                if (c == null) continue;
                var loc = c["Location"];
                double.TryParse(loc?["lat"]?.GetValue<string>(),  out var lat);
                double.TryParse(loc?["long"]?.GetValue<string>(), out var lng);

                result.Add(new CircuitDto(
                    CircuitId:   c["circuitId"]?.GetValue<string>() ?? "",
                    CircuitName: c["circuitName"]?.GetValue<string>() ?? "",
                    Locality:    loc?["locality"]?.GetValue<string>() ?? "",
                    Country:     loc?["country"]?.GetValue<string>() ?? "",
                    Latitude:    lat,
                    Longitude:   lng,
                    Url:         c["url"]?.GetValue<string>()
                ));
            }
        }
        catch { /* return whatever was parsed */ }
        return result;
    }

    private static List<PitStopDto> ParsePitStops(string json, int round)
    {
        var result = new List<PitStopDto>();
        try
        {
            var node  = JsonNode.Parse(json);
            var races = node?["MRData"]?["RaceTable"]?["Races"]?.AsArray();
            var race  = races?.Count > 0 ? races[0] : null;
            var stops = race?["PitStops"]?.AsArray();
            if (stops == null) return result;

            foreach (var s in stops)
            {
                if (s == null) continue;
                result.Add(new PitStopDto(
                    Round:    round,
                    DriverId: s["driverId"]?.GetValue<string>() ?? "",
                    Stop:     int.TryParse(s["stop"]?.GetValue<string>(),     out var stop) ? stop : 0,
                    Lap:      int.TryParse(s["lap"]?.GetValue<string>(),      out var lap)  ? lap  : 0,
                    Time:     s["time"]?.GetValue<string>() ?? "",
                    Duration: s["duration"]?.GetValue<string>() ?? ""
                ));
            }
        }
        catch { /* return whatever was parsed */ }
        return result;
    }

    private static List<ConstructorStandingDto> ParseConstructorStandings(string json)
    {
        var result = new List<ConstructorStandingDto>();
        try
        {
            var node  = JsonNode.Parse(json);
            var lists = node?["MRData"]?["StandingsTable"]?["StandingsLists"]?.AsArray();
            var list  = lists?.Count > 0 ? lists[0] : null;
            var standings = list?["ConstructorStandings"]?.AsArray();
            if (standings == null) return result;

            foreach (var s in standings)
            {
                if (s == null) continue;
                var ctor = s["Constructor"];
                result.Add(new ConstructorStandingDto(
                    Position:      int.TryParse(s["position"]?.GetValue<string>(), out var pos) ? pos : 0,
                    ConstructorId: ctor?["constructorId"]?.GetValue<string>() ?? "",
                    Name:          ctor?["name"]?.GetValue<string>() ?? "",
                    Nationality:   ctor?["nationality"]?.GetValue<string>() ?? "",
                    Points:        int.TryParse(s["points"]?.GetValue<string>(),   out var pts) ? pts : 0,
                    Wins:          int.TryParse(s["wins"]?.GetValue<string>(),     out var w)   ? w   : 0
                ));
            }
        }
        catch { /* return whatever was parsed */ }
        return result;
    }

    private static List<SessionResultDto> ParseRaceResults(string json)
    {
        var result = new List<SessionResultDto>();
        try
        {
            var node  = JsonNode.Parse(json);
            var races = node?["MRData"]?["RaceTable"]?["Races"]?.AsArray();
            var race  = races?.Count > 0 ? races[0] : null;
            if (race == null) return result;

            int.TryParse(race["round"]?.GetValue<string>(), out var round);
            var raceName = race["raceName"]?.GetValue<string>() ?? "";
            var results  = race["Results"]?.AsArray();
            if (results == null) return result;

            foreach (var r in results)
            {
                if (r == null) continue;
                var driver = r["Driver"];
                var ctor   = r["Constructor"];
                int? pos   = int.TryParse(r["position"]?.GetValue<string>(), out var p) ? p : null;
                int? grid  = int.TryParse(r["grid"]?.GetValue<string>(),     out var g) ? g : null;
                int? pts   = int.TryParse(r["points"]?.GetValue<string>(),   out var pt) ? (int?)pt : null;

                result.Add(new SessionResultDto(
                    Round:         round,
                    RaceName:      raceName,
                    DriverId:      driver?["driverId"]?.GetValue<string>() ?? "",
                    ConstructorId: ctor?["constructorId"]?.GetValue<string>() ?? "",
                    Grid:          grid,
                    Position:      pos,
                    Time:          r["Time"]?["time"]?.GetValue<string>(),
                    Points:        pts,
                    FastestLap:    r["FastestLap"]?["Time"]?["time"]?.GetValue<string>()
                ));
            }
        }
        catch { /* return whatever was parsed */ }
        return result;
    }
}

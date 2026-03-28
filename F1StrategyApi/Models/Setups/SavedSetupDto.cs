using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace F1StrategyApi.Models.Setups;

/// <summary>Car configuration snapshot saved by the user.</summary>
public class SavedSetupDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public required string Name { get; set; }

    public required CarConfigDto Config { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>All car tuning parameters (0–100 range).</summary>
public class CarConfigDto
{
    public int FrontWing       { get; set; } = 50;
    public int RearWing        { get; set; } = 50;
    public int FloorRideHeight { get; set; } = 50;
    public int DrsDelta        { get; set; } = 50;
    public int IceOutput       { get; set; } = 50;
    public int ErsRate         { get; set; } = 50;
    public int BatteryCapacity { get; set; } = 50;
    public int FrontSuspension { get; set; } = 50;
    public int WeightDist      { get; set; } = 50;
}

/// <summary>DTO sent to / received from the frontend (camelCase via System.Text.Json).</summary>
public class SavedSetupRequest
{
    public required string Name   { get; set; }
    public required CarConfigDto Config { get; set; }
}

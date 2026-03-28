using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace F1StrategyApi.Models.Setups;

/// <summary>A race strategy consisting of multiple tyre stints.</summary>
public class StrategyDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public required string Label { get; set; }

    public required List<StintEntry> Stints { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class StintEntry
{
    public required string Id       { get; set; }
    public required string Compound { get; set; }
    public int             Laps     { get; set; }
}

/// <summary>DTO for create / update requests.</summary>
public class StrategyRequest
{
    public required string          Label  { get; set; }
    public required List<StintEntry> Stints { get; set; }
}

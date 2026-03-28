namespace F1StrategyApi.Configuration;

public class ExternalApiOptions
{
    public const string SectionName = "ExternalApis";

    public string JolpicaBaseUrl { get; init; } = string.Empty;
    public string OpenF1BaseUrl   { get; init; } = string.Empty;
    public string WeatherBaseUrl  { get; init; } = string.Empty;
}

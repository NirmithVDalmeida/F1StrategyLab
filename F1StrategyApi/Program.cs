using F1StrategyApi.Extensions;
using MongoDB.Driver;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();
builder.Services.AddF1HttpClients(builder.Configuration);
builder.Services.AddF1Services();
builder.Services.AddMongoDb(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ViteDev", policy =>
    {
        var origins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:5173", "http://localhost:4173"];

        policy.WithOrigins(origins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "F1 Strategy Lab API";
        options.Theme = ScalarTheme.DeepSpace;
    });
}

app.UseCors("ViteDev");
app.UseAuthorization();
app.MapControllers();

app.Run();

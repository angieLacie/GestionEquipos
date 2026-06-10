using Nova.Seguridad.Api;
using Nova.Seguridad.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

// --- Módulos (monolito modular, ADR-006) ---
builder.Services.AddSeguridadApplication();
builder.Services.AddSeguridadInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.MapGet("/health", () => Results.Ok(new { status = "ok" })).WithTags("Infra");

// --- Endpoints por módulo ---
app.MapSeguridadEndpoints();

app.Run();

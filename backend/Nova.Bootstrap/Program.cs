using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Nova.Maestros.Api;
using Nova.Maestros.Infrastructure;
using Nova.Rol.Api;
using Nova.Rol.Infrastructure;
using Nova.Seguridad.Api;
using Nova.Seguridad.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Token JWT emitido por /v1/segu/auth/login"
    });
    o.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }] = []
    });
});
builder.Services.AddProblemDetails();

// --- Autenticación / Autorización (sesión por JWT) ---
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["SecretKey"]!))
        };
    });
builder.Services.AddAuthorization();

// --- Módulos (monolito modular, ADR-006) ---
builder.Services.AddSeguridadApplication();
builder.Services.AddSeguridadInfrastructure(builder.Configuration);
builder.Services.AddMaestrosApplication();
builder.Services.AddMaestrosInfrastructure(builder.Configuration);
builder.Services.AddRolApplication();
builder.Services.AddRolInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" })).WithTags("Infra");

// --- Endpoints por módulo ---
app.MapSeguridadEndpoints();
app.MapMaestrosEndpoints();
app.MapRolEndpoints();

app.Run();

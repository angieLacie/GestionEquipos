using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Nova.Seguridad.Application;

namespace Nova.Seguridad.Infrastructure;

/// <summary>Opciones de firma/emisión del token de sesión.</summary>
public sealed class JwtOptions
{
    public string Issuer { get; init; } = "nova";
    public string Audience { get; init; } = "nova-clients";
    public string SecretKey { get; init; } = default!;
    public int MinutosVigencia { get; init; } = 60;
}

internal sealed class JwtTokenService(JwtOptions options) : ITokenService
{
    public string EmitirToken(Guid idUsuario, string nombreUsuario)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, idUsuario.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, nombreUsuario),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(options.MinutosVigencia),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

/// <summary>Token de un solo uso para restablecer contraseña (RN-SEGU-37). JWT corto con purpose=pwd_reset.</summary>
internal sealed class ResetTokenService(JwtOptions options) : IResetTokenService
{
    private const string Purpose = "pwd_reset";
    private const int MinutosVigencia = 10;

    public string EmitirTokenReset(Guid idUsuario)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: Purpose,
            claims: [new Claim(JwtRegisteredClaimNames.Sub, idUsuario.ToString())],
            expires: DateTime.UtcNow.AddMinutes(MinutosVigencia),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public Guid? ValidarTokenReset(string token)
    {
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = options.Issuer,
            ValidateAudience = true,
            ValidAudience = Purpose,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SecretKey)),
            ClockSkew = TimeSpan.Zero
        };
        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(token, parameters, out _);
            var sub = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                      ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(sub, out var id) ? id : null;
        }
        catch
        {
            return null; // token inválido/expirado/manipulado → fallo seguro
        }
    }
}

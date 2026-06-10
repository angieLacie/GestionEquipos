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

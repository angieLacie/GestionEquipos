using Nova.Seguridad.Domain;

namespace Nova.Seguridad.Application;

/// <summary>Escritura del log append-only de auditoría de seguridad (RN-SEGU-25).</summary>
public interface IAuditoriaRepository
{
    Task AgregarAsync(AuditoriaSeguridad registro, CancellationToken ct = default);
}

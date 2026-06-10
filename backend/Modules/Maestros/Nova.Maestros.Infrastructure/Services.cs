using Nova.Maestros.Application;

namespace Nova.Maestros.Infrastructure;

/// <summary>Reloj del sistema (UTC).</summary>
internal sealed class SystemClock : IClock
{
    public DateTimeOffset Now => DateTimeOffset.UtcNow;
    public DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);
}

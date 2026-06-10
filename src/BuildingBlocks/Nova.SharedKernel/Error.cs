namespace Nova.SharedKernel;

/// <summary>Error de dominio/aplicación con código estable y mensaje legible.</summary>
public sealed record Error(string Code, string Message)
{
    public static readonly Error None = new(string.Empty, string.Empty);

    public static Error Validacion(string message) => new("validacion", message);
    public static Error NoEncontrado(string message) => new("no_encontrado", message);
    public static Error Conflicto(string message) => new("conflicto", message);
    public static Error NoAutorizado(string message) => new("no_autorizado", message);
}

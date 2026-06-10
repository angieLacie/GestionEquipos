namespace Nova.SharedKernel;

/// <summary>Raíz de entidad con identidad por <see cref="Id"/> (Guid).</summary>
public abstract class Entity
{
    protected Entity(Guid id) => Id = id;

    // Requerido por EF Core.
    protected Entity() { }

    public Guid Id { get; protected set; }

    public override bool Equals(object? obj)
        => obj is Entity other && other.GetType() == GetType() && other.Id == Id;

    public override int GetHashCode() => Id.GetHashCode();
}

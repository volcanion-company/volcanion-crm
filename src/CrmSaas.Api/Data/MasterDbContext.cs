using CrmSaas.Api.Entities;
using CrmSaas.Api.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace CrmSaas.Api.Data;

/// <summary>
/// Master database context for global data (schema: master)
/// Contains: Tenants, Permissions (global), AuditLogs (all tenants)
/// </summary>
public class MasterDbContext(DbContextOptions<MasterDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Permission> Permissions => Set<Permission>();
    // Note: Users, Roles are in TenantDbContext (tenant-specific)

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // With SharedDatabase strategy, all tables are in the same schema (dbo)
        // Don't use separate schema to avoid FK constraint issues
        
        // IMPORTANT: Ignore all types except the ones we explicitly configure
        // This prevents EF from discovering User, Role, and other tenant-specific entities
        var typesToIgnore = typeof(MasterDbContext).Assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Namespace == "CrmSaas.Api.Entities")
            .Where(t => t != typeof(Tenant) && t != typeof(Permission) && t != typeof(AuditLog))
            .ToList();
        
        foreach (var type in typesToIgnore)
        {
            modelBuilder.Ignore(type);
        }
        
        // Tenant configuration
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("Tenants"); // Use default schema (dbo)
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Identifier).IsUnique();
            entity.HasIndex(e => e.Subdomain).IsUnique().HasFilter("[Subdomain] IS NOT NULL");
            entity.HasQueryFilter(e => !e.IsDeleted);
            
            // Ignore navigation properties (Users, Roles are in TenantDbContext)
            entity.Ignore(e => e.Users);
            entity.Ignore(e => e.Roles);
        });

        // Permission configuration (global, not tenant-specific)
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("Permissions"); // Use default schema (dbo)
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
        });

        // AuditLog configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs"); // Use default schema (dbo)
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.EntityType);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
        });
    }
}

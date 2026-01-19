using CrmSaas.Api.Authorization;
using CrmSaas.Api.Common;
using CrmSaas.Api.Data;
using CrmSaas.Api.Entities;
using CrmSaas.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrmSaas.Api.Controllers;

[Authorize]
public class TenantsController(ITenantService tenantService, MasterDbContext db, TenantDbContext tenantDb, ILogger<TenantsController> logger) : BaseController
{
    /// <summary>
    /// Get all tenants with pagination
    /// </summary>
    [HttpGet]
    [RequirePermission(Permissions.TenantView)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<TenantResponse>>), 200)]
    public async Task<ActionResult<ApiResponse<PagedResult<TenantResponse>>>> GetAll([FromQuery] PaginationParams @params)
    {
        var query = db.Tenants.AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(@params.Search))
        {
            var searchLower = @params.Search.ToLower();
            query = query.Where(t => 
                t.Name.ToLower().Contains(searchLower) ||
                t.Identifier.ToLower().Contains(searchLower) ||
                (t.Subdomain != null && t.Subdomain.ToLower().Contains(searchLower))
            );
        }

        // Apply sorting
        query = @params.SortBy?.ToLower() switch
        {
            "name" => @params.SortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "identifier" => @params.SortDescending ? query.OrderByDescending(t => t.Identifier) : query.OrderBy(t => t.Identifier),
            "status" => @params.SortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "plan" => @params.SortDescending ? query.OrderByDescending(t => t.Plan) : query.OrderBy(t => t.Plan),
            "createdat" => @params.SortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
            _ => query.OrderByDescending(t => t.CreatedAt) // Default sort
        };

        var totalCount = await query.CountAsync();
        
        var tenants = await query
            .Skip((@params.PageNumber - 1) * @params.PageSize)
            .Take(@params.PageSize)
            .ToListAsync();

        // Get user counts for each tenant
        var tenantIds = tenants.Select(t => t.Id).ToList();
        var userCounts = await tenantDb.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => tenantIds.Contains(u.TenantId) && !u.IsDeleted)
            .GroupBy(u => u.TenantId)
            .Select(g => new { TenantId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TenantId, x => x.Count);

        var response = tenants.Select(t => MapToResponse(t, userCounts.GetValueOrDefault(t.Id, 0))).ToList();
        var pagedResult = PagedResult<TenantResponse>.Create(response, totalCount, @params.PageNumber, @params.PageSize);

        return OkResponse(pagedResult);
    }

    /// <summary>
    /// Get tenant by id with users
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission(Permissions.TenantView)]
    [ProducesResponseType(typeof(ApiResponse<TenantDetailResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<ActionResult<ApiResponse<TenantDetailResponse>>> GetById(Guid id)
    {
        var tenant = await tenantService.GetByIdAsync(id);
        
        if (tenant == null)
        {
            return NotFoundResponse<TenantDetailResponse>($"Tenant with id {id} not found");
        }

        // Get users belonging to this tenant - query directly from database ignoring filters
        var users = await tenantDb.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => u.TenantId == id && !u.IsDeleted)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .ToListAsync();

        Console.WriteLine($"[DEBUG] Tenant ID: {id}, Found {users.Count} users");
        foreach (var u in users)
        {
            Console.WriteLine($"[DEBUG] - User: {u.Email}, TenantId: {u.TenantId}");
        }

        return OkResponse(MapToDetailResponse(tenant, users));
    }

    /// <summary>
    /// Register a new tenant
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<TenantResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 409)]
    public async Task<ActionResult<ApiResponse<TenantResponse>>> Register([FromBody] CreateTenantRequest request)
    {
        if (await tenantService.ExistsAsync(request.Identifier))
        {
            return Conflict(ApiResponse<TenantResponse>.Fail($"Tenant with identifier '{request.Identifier}' already exists"));
        }

        var tenant = await tenantService.CreateAsync(request);
        return CreatedResponse(MapToResponse(tenant), "Tenant created successfully");
    }

    /// <summary>
    /// Create a new tenant
    /// </summary>
    [HttpPost]
    [RequirePermission(Permissions.TenantCreate)]
    [ProducesResponseType(typeof(ApiResponse<TenantResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 409)]
    public async Task<ActionResult<ApiResponse<TenantResponse>>> Create([FromBody] CreateTenantRequest request)
    {
        if (await tenantService.ExistsAsync(request.Identifier))
        {
            return Conflict(ApiResponse<TenantResponse>.Fail($"Tenant with identifier '{request.Identifier}' already exists"));
        }

        var tenant = await tenantService.CreateAsync(request);
        return CreatedResponse(MapToResponse(tenant), "Tenant created successfully");
    }

    /// <summary>
    /// Update tenant
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission(Permissions.TenantUpdate)]
    [ProducesResponseType(typeof(ApiResponse<TenantResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<ActionResult<ApiResponse<TenantResponse>>> Update(Guid id, [FromBody] UpdateTenantRequest request)
    {
        try
        {
            var tenant = await tenantService.UpdateAsync(id, request);
            return OkResponse(MapToResponse(tenant), "Tenant updated successfully");
        }
        catch (KeyNotFoundException)
        {
            return NotFoundResponse<TenantResponse>($"Tenant with id {id} not found");
        }
    }

    /// <summary>
    /// Delete tenant
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission(Permissions.TenantDelete)]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var result = await tenantService.DeleteAsync(id);
        
        if (!result)
        {
            return NotFoundResponse($"Tenant with id {id} not found");
        }

        return OkResponse("Tenant deleted successfully");
    }

    private static TenantResponse MapToResponse(Tenant tenant, int userCount = 0) => new()
    {
        Id = tenant.Id,
        Name = tenant.Name,
        Identifier = tenant.Identifier,
        Subdomain = tenant.Subdomain,
        Status = tenant.Status.ToString(),
        Plan = tenant.Plan.ToString(),
        MaxUsers = tenant.MaxUsers,
        MaxStorageBytes = tenant.MaxStorageBytes,
        LogoUrl = tenant.LogoUrl,
        PrimaryColor = tenant.PrimaryColor,
        TimeZone = tenant.TimeZone,
        Culture = tenant.Culture,
        UserCount = userCount,
        CreatedAt = tenant.CreatedAt,
        UpdatedAt = tenant.UpdatedAt
    };

    private static TenantDetailResponse MapToDetailResponse(Tenant tenant, List<User> users) => new()
    {
        Id = tenant.Id,
        Name = tenant.Name,
        Identifier = tenant.Identifier,
        Subdomain = tenant.Subdomain,
        Status = tenant.Status.ToString(),
        Plan = tenant.Plan.ToString(),
        MaxUsers = tenant.MaxUsers,
        MaxStorageBytes = tenant.MaxStorageBytes,
        LogoUrl = tenant.LogoUrl,
        PrimaryColor = tenant.PrimaryColor,
        TimeZone = tenant.TimeZone,
        Culture = tenant.Culture,
        CreatedAt = tenant.CreatedAt,
        UpdatedAt = tenant.UpdatedAt,
        UserCount = users.Count,
        Users = users.Select(u => new TenantUserResponse
        {
            Id = u.Id,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            FullName = u.FullName,
            Phone = u.Phone,
            Status = u.Status.ToString(),
            LastLoginAt = u.LastLoginAt,
            Roles = u.UserRoles
                .Where(ur => ur.Role != null)
                .Select(ur => ur.Role!.Name)
                .ToList()
        }).ToList()
    };
}

public class TenantResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Subdomain { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
    public int MaxUsers { get; set; }
    public long MaxStorageBytes { get; set; }
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? TimeZone { get; set; }
    public string? Culture { get; set; }
    public int UserCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class TenantDetailResponse : TenantResponse
{
    public List<TenantUserResponse> Users { get; set; } = [];
}

public class TenantUserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? LastLoginAt { get; set; }
    public List<string> Roles { get; set; } = [];
}

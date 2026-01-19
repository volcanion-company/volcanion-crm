using CrmSaas.Api.Common;
using CrmSaas.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrmSaas.Api.Controllers;

public class AuthController : BaseController
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user and get access token
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request, GetIpAddress());

        if (!result.IsSuccess)
        {
            return Unauthorized(ApiResponse.Fail(result.Error ?? "Authentication failed"));
        }

        var response = new AuthResponse
        {
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            ExpiresIn = 3600, // 1 hour
            User = result.User!
        };

        return OkResponse(response, "Login successful");
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, GetIpAddress());

        if (!result.IsSuccess)
        {
            return Unauthorized(ApiResponse.Fail(result.Error ?? "Token refresh failed"));
        }

        var response = new AuthResponse
        {
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            ExpiresIn = 3600,
            User = result.User!
        };

        return OkResponse(response, "Token refreshed successfully");
    }

    /// <summary>
    /// Revoke refresh token (logout)
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<ActionResult<ApiResponse>> Logout([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RevokeTokenAsync(request.RefreshToken, GetIpAddress());

        if (!result)
        {
            return BadRequestResponse("Invalid token");
        }

        return OkResponse("Logged out successfully");
    }

    /// <summary>
    /// Revoke all refresh tokens (logout from all devices)
    /// </summary>
    [HttpPost("logout-all")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    public async Task<ActionResult<ApiResponse>> LogoutAll()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequestResponse("Invalid user");
        }

        await _authService.RevokeAllTokensAsync(userGuid, GetIpAddress());

        return OkResponse("Logged out from all devices successfully");
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    public ActionResult<ApiResponse<UserProfileResponse>> GetProfile()
    {
        var user = new UserProfileResponse
        {
            Id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "",
            Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "",
            Name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "",
            TenantId = User.FindFirst("tenant_id")?.Value ?? "",
            Roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList(),
            Permissions = User.FindAll("permission").Select(c => c.Value).ToList()
        };

        return OkResponse(user);
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserProfileResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<ActionResult<ApiResponse<UserProfileResponse>>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequestResponse<UserProfileResponse>("Invalid user");
        }

        try
        {
            var user = await _authService.UpdateProfileAsync(userGuid, request);
            
            if (user == null)
            {
                return NotFoundResponse<UserProfileResponse>("User not found");
            }

            var response = new UserProfileResponse
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Name = user.FullName,
                TenantId = user.TenantId.ToString(),
                Roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList(),
                Permissions = User.FindAll("permission").Select(c => c.Value).ToList()
            };

            return OkResponse(response, "Profile updated successfully");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequestResponse<UserProfileResponse>(ex.Message);
        }
    }

    /// <summary>
    /// Change current user password
    /// </summary>
    [HttpPut("change-password")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<ActionResult<ApiResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequestResponse("Invalid user");
        }

        var success = await _authService.ChangePasswordAsync(userGuid, request);
        
        if (!success)
        {
            return BadRequestResponse("Current password is incorrect");
        }

        return OkResponse("Password changed successfully");
    }
}

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public UserDto User { get; set; } = null!;
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class UserProfileResponse
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];
    public List<string> Permissions { get; set; } = [];
}

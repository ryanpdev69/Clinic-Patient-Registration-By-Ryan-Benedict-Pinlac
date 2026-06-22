using ClinicPatient.Api.Data;
using ClinicPatient.Api.Dtos;
using ClinicPatient.Api.Models;
using ClinicPatient.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicPatient.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext dbContext, IJwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await dbContext.Users
            .SingleOrDefaultAsync(existingUser => existingUser.Username == request.Username);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var passwordHasher = new PasswordHasher<User>();
        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        return Ok(new LoginResponse
        {
            Token = jwtTokenService.GenerateToken(user),
            Username = user.Username
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logged out successfully." });
    }
}

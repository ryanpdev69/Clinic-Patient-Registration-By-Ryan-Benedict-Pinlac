using ClinicPatient.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ClinicPatient.Api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext dbContext)
    {
        dbContext.Database.Migrate();

        if (dbContext.Users.Any(user => user.Username == "admin"))
        {
            return;
        }

        var admin = new User
        {
            Username = "admin",
            CreatedAt = DateTime.UtcNow
        };

        var passwordHasher = new PasswordHasher<User>();
        admin.PasswordHash = passwordHasher.HashPassword(admin, "admin123");

        dbContext.Users.Add(admin);
        dbContext.SaveChanges();
    }
}

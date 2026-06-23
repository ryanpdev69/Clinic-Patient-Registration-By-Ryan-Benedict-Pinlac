using ClinicPatient.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ClinicPatient.Api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext dbContext)
    {
        dbContext.Database.Migrate();

        SeedAdminUser(dbContext);
        SeedSamplePatients(dbContext);
    }

    private static void SeedAdminUser(AppDbContext dbContext)
    {
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

    private static void SeedSamplePatients(AppDbContext dbContext)
    {
        var createdAt = DateTime.UtcNow;
        var samplePatients = new[]
        {
            new Patient
            {
                PatientName = "Wally Bayola",
                BirthDate = new DateTime(1990, 3, 15),
                Gender = "Male",
                ContactNumber = "09175551201",
                Address = "123 Sampaguita St., Green Meadows, Quezon City",
                CreatedAt = createdAt,
                CreatedBy = "admin"
            },
            new Patient
            {
                PatientName = "Jose Manalo",
                BirthDate = new DateTime(1988, 8, 22),
                Gender = "Male",
                ContactNumber = "09185552302",
                Address = "45 Mabini Ave., San Lorenzo, Makati City",
                CreatedAt = createdAt,
                CreatedBy = "admin"
            },
            new Patient
            {
                PatientName = "Pooh",
                BirthDate = new DateTime(1992, 11, 9),
                Gender = "Male",
                ContactNumber = "09195553403",
                Address = "78 Acacia Rd., Villa Verde, Pasig City",
                CreatedAt = createdAt,
                CreatedBy = "admin"
            },
            new Patient
            {
                PatientName = "Betong Sumaya",
                BirthDate = new DateTime(1989, 1, 30),
                Gender = "Male",
                ContactNumber = "09205554504",
                Address = "16 Rosal St., Sunshine Heights, Antipolo City",
                CreatedAt = createdAt,
                CreatedBy = "admin"
            },
            new Patient
            {
                PatientName = "Boobay",
                BirthDate = new DateTime(1991, 6, 18),
                Gender = "Male",
                ContactNumber = "09215555605",
                Address = "90 Mahogany Lane, Golden Village, Bacoor City",
                CreatedAt = createdAt,
                CreatedBy = "admin"
            }
        };

        var existingPatientNames = dbContext.Patients
            .Select(patient => patient.PatientName)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var existingContactNumbers = dbContext.Patients
            .Select(patient => patient.ContactNumber)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var patientsToAdd = samplePatients
            .Where(patient =>
                !existingPatientNames.Contains(patient.PatientName) &&
                !existingContactNumbers.Contains(patient.ContactNumber))
            .ToList();

        if (patientsToAdd.Count == 0)
        {
            return;
        }

        dbContext.Patients.AddRange(patientsToAdd);
        dbContext.SaveChanges();
    }
}

using ClinicPatient.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicPatient.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Patient> Patients => Set<Patient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(user => user.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(user => user.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<Patient>()
            .Property(patient => patient.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}

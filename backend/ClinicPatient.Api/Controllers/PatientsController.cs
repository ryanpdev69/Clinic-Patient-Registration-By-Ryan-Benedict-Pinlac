using ClinicPatient.Api.Data;
using ClinicPatient.Api.Dtos;
using ClinicPatient.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ClinicPatient.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PatientsController(AppDbContext dbContext) : ControllerBase
{
    private string CurrentUsername => User.FindFirstValue(ClaimTypes.Name) ?? "admin";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Patient>>> GetPatients()
    {
        var patients = await dbContext.Patients
            .OrderBy(patient => patient.PatientName)
            .ToListAsync();

        return Ok(patients);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Patient>> GetPatient(int id)
    {
        var patient = await dbContext.Patients.FindAsync(id);

        if (patient is null)
        {
            return NotFound(new { message = "Patient not found." });
        }

        return Ok(patient);
    }

    [HttpPost]
    public async Task<ActionResult<Patient>> CreatePatient(PatientRequest request)
    {
        var patient = new Patient
        {
            PatientName = request.PatientName.Trim(),
            BirthDate = request.BirthDate!.Value,
            Gender = request.Gender.Trim(),
            ContactNumber = request.ContactNumber.Trim(),
            Address = request.Address.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = CurrentUsername
        };

        dbContext.Patients.Add(patient);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePatient(int id, PatientRequest request)
    {
        var patient = await dbContext.Patients.FindAsync(id);

        if (patient is null)
        {
            return NotFound(new { message = "Patient not found." });
        }

        patient.PatientName = request.PatientName.Trim();
        patient.BirthDate = request.BirthDate!.Value;
        patient.Gender = request.Gender.Trim();
        patient.ContactNumber = request.ContactNumber.Trim();
        patient.Address = request.Address.Trim();
        patient.UpdatedAt = DateTime.UtcNow;
        patient.UpdatedBy = CurrentUsername;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await dbContext.Patients.FindAsync(id);

        if (patient is null)
        {
            return NotFound(new { message = "Patient not found." });
        }

        dbContext.Patients.Remove(patient);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}

using System.ComponentModel.DataAnnotations;

namespace ClinicPatient.Api.Dtos;

public class PatientRequest
{
    [Required]
    [MaxLength(120)]
    public string PatientName { get; set; } = string.Empty;

    [Required]
    public DateTime? BirthDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string ContactNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    public string Address { get; set; } = string.Empty;
}

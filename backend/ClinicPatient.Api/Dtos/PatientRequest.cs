using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace ClinicPatient.Api.Dtos;

public class PatientRequest : IValidatableObject
{
    [Required]
    [MaxLength(50)]
    [RegularExpression(@"^\p{L}[\p{L}.]*(?: \p{L}[\p{L}.]*)*$",
        ErrorMessage = "Patient name must start with a letter and contain only letters, spaces, or periods.")]
    public string PatientName { get; set; } = string.Empty;

    [Required]
    public DateTime? BirthDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [MaxLength(11)]
    [RegularExpression(@"^09\d{9}$", ErrorMessage = "Contact number must start with 09 and be exactly 11 digits.")]
    public string ContactNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Address { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var today = DateTime.UtcNow.Date;
        var oldestAllowedBirthDate = today.AddYears(-120);

        if (BirthDate.HasValue)
        {
            var birthDate = BirthDate.Value.Date;

            if (birthDate > today)
            {
                yield return new ValidationResult(
                    "Birth date cannot be in the future.",
                    new[] { nameof(BirthDate) });
            }

            if (birthDate < oldestAllowedBirthDate)
            {
                yield return new ValidationResult(
                    "Birth date cannot be more than 120 years ago.",
                    new[] { nameof(BirthDate) });
            }
        }

        if (Gender is not "Female" and not "Male")
        {
            yield return new ValidationResult(
                "Please select Female or Male.",
                new[] { nameof(Gender) });
        }

        var address = Address.Trim();

        if (!string.IsNullOrWhiteSpace(address))
        {
            if (!Regex.IsMatch(address, @"^[\p{L}\d., ]+$") || address.StartsWith(' ') || address.Contains("  "))
            {
                yield return new ValidationResult(
                    "Address can contain only letters, numbers, spaces, periods, or commas and cannot contain double spaces.",
                    new[] { nameof(Address) });
            }

            if (!Regex.IsMatch(address, @"\p{L}"))
            {
                yield return new ValidationResult(
                    "Address must include at least one letter.",
                    new[] { nameof(Address) });
            }
        }
    }
}

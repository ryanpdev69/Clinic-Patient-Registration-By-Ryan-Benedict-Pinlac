using ClinicPatient.Api.Models;

namespace ClinicPatient.Api.Services;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}

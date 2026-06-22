using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicPatient.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUniquePatientIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM "Patients"
                WHERE "Id" NOT IN (
                    SELECT MIN("Id")
                    FROM "Patients"
                    GROUP BY "ContactNumber"
                )
                OR "Id" NOT IN (
                    SELECT MIN("Id")
                    FROM "Patients"
                    GROUP BY "PatientName"
                );
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Patients_ContactNumber",
                table: "Patients",
                column: "ContactNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Patients_PatientName",
                table: "Patients",
                column: "PatientName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Patients_ContactNumber",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Patients_PatientName",
                table: "Patients");
        }
    }
}

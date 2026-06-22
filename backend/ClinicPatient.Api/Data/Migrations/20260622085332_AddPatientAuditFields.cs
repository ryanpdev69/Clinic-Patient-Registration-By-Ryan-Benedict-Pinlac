using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicPatient.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Patients",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "admin");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Patients",
                type: "TEXT",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Patients");
        }
    }
}

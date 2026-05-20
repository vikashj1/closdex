import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class HireApplicationDto {
  /** Annual CTC in INR (whole rupees). */
  @IsInt()
  @Min(1)
  annualCtc!: number;

  /** Commission rate as a decimal — SOW caps at 10-15% of annual CTC. */
  @IsNumber()
  @Min(0.10)
  @Max(0.15)
  commissionRate!: number;
}

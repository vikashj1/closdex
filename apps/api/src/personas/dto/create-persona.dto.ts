import { IsString, MinLength } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  role!: string;

  @IsString()
  company!: string;

  @IsString()
  @MinLength(10)
  contextSnippet!: string;

  /** LLM system prompt that drives this lead's behaviour. Never exposed to
   *  non-admin viewers (would ruin the sim). */
  @IsString()
  @MinLength(20)
  personalityPrompt!: string;
}

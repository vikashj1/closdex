import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsInt, IsString, Min, MinLength, ValidateNested,
} from 'class-validator';

export class QuizQuestionDto {
  @IsString()
  @MinLength(3)
  q!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  /** Index into `options`. Validated against `options.length` in the service. */
  @IsInt()
  @Min(0)
  answerIndex!: number;
}

export class UpsertQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions!: QuizQuestionDto[];

  @IsInt()
  @Min(0)
  rewardPoints!: number;
}

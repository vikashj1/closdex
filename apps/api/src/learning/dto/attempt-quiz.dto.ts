import { ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';

export class AttemptQuizDto {
  /** One answer index per question, in question order. Validated against the
   *  quiz's question count + options length in the service. */
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  answerIndices!: number[];
}

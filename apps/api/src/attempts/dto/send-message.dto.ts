import { IsInt, IsObject, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

/** Anti-cheat client telemetry captured on the salesperson textarea.
 *  Optional — older clients (or non-browser callers) just omit it. */
export class ClientMetaDto {
  /** Number of paste events fired into the textarea between sends. */
  @IsOptional()
  @IsInt()
  @Min(0)
  pasteCount?: number;

  /** Total characters that arrived via paste events (sum of pasted text lengths). */
  @IsOptional()
  @IsInt()
  @Min(0)
  pastedChars?: number;

  /** Milliseconds from the first keystroke in this message to the send click. */
  @IsOptional()
  @IsInt()
  @Min(0)
  totalTypingMs?: number;

  /** Total characters in the submitted message body. */
  @IsOptional()
  @IsInt()
  @Min(0)
  charCount?: number;

  /** Chars in this message that arrived via Web Speech API or native
   *  OS/keyboard dictation. Speech input necessarily lands in the field
   *  faster than a human types; reporting this lets the suspicion service
   *  skip the superhuman-speed and instant-typing flags on this message. */
  @IsOptional()
  @IsInt()
  @Min(0)
  dictationChars?: number;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsObject()
  @Type(() => ClientMetaDto)
  clientMeta?: ClientMetaDto;
}

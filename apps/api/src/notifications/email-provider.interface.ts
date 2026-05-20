export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

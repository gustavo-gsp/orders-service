import { envSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    // imprime erros legíveis e falha rápido
    // eslint-disable-next-line no-console
    console.error(parsed.error.format());
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}
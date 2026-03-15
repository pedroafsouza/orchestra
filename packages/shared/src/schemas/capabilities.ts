import { z } from 'zod';

export const ClientCapabilitiesSchema = z.object({
  version: z.string(),
  supported: z.array(z.string()),
});
export type ClientCapabilities = z.infer<typeof ClientCapabilitiesSchema>;

export interface HandshakeResponse {
  flow: any; // OrchestraFlow — validated separately
  config?: {
    mapboxToken?: string;
  };
}

import { z } from "zod";

const sourceSchema = z.object({ data: z.string(), liturgia: z.string(), cor: z.string(), oracoes: z.record(z.string(), z.unknown()).optional(), leituras: z.record(z.string(), z.array(z.object({ referencia: z.string(), titulo: z.string().optional(), texto: z.string().optional(), refrao: z.string().optional() })).optional()).optional(), antifonas: z.record(z.string(), z.string()).optional() });
export type LiturgiaSource = z.infer<typeof sourceSchema>;
export const fetchLiturgiaSource = async (date: string): Promise<LiturgiaSource> => { const [year, month, day] = date.split("-"); const response = await fetch(`https://liturgia.up.railway.app/v2/?dia=${day}&mes=${month}&ano=${year}`); if (!response.ok) throw new Error(`Liturgia source returned ${response.status}`); return sourceSchema.parse(await response.json() as unknown); };

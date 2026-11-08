import { handler } from '../_lib/http';
import { str } from '../_lib/validate';
import { ApiError } from '../_lib/errors';
import { askFarmingQuestion } from '../_lib/aiCore';
import { Language } from '../../types';

// POST /api/v1/assistant  { question, lang, history }
export default handler(async ({ body }) => {
  const question = str(body.question, 'question', 1000);
  const lang = (Object.values(Language) as string[]).includes(body.lang) ? (body.lang as Language) : Language.ENGLISH;
  if (body.history !== undefined && !Array.isArray(body.history)) throw new ApiError(400, 'INVALID_INPUT', 'history must be a list.');
  const history = (body.history ?? []).slice(-6).map((m: any, i: number) => ({
    id: String(i),
    role: m?.role === 'user' ? ('user' as const) : ('assistant' as const),
    text: str(m?.text, 'history text', 1500, { required: false }),
    timestamp: 0,
  }));
  return { answer: await askFarmingQuestion(question, lang, history) };
}, { limitPerMinute: 20, anonLimitPerMinute: 8 });

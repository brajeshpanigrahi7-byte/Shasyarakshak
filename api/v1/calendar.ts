import { handler } from '../_lib/http';
import { str, isoDate } from '../_lib/validate';
import { generateCropCalendar } from '../_lib/aiCore';

// POST /api/v1/calendar  { crop, sowingDate }
export default handler(async ({ body }) => {
  return generateCropCalendar(str(body.crop, 'crop', 60), isoDate(body.sowingDate, 'sowingDate'));
}, { limitPerMinute: 10, requireAuth: true });

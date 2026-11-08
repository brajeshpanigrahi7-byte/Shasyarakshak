import { handler } from '../_lib/http';
import { validateImage, str, oneOf } from '../_lib/validate';
import { analyzeCropImage } from '../_lib/aiCore';

// POST /api/v1/diagnosis  { image: <base64>, cropType, cropName? }
export default handler(async ({ body }) => {
  const { base64, mime } = validateImage(body.image);
  const cropType = oneOf(body.cropType ?? 'auto', 'cropType', ['auto', 'paddy', 'millet', 'vegetable'] as const);
  const cropName = str(body.cropName, 'cropName', 60, { required: false });
  return analyzeCropImage(base64, cropType, cropName || undefined, mime);
}, { limitPerMinute: 10, requireAuth: true });

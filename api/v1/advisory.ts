import { handler } from '../_lib/http';
import { str, isoDate, oneOf } from '../_lib/validate';
import { ApiError } from '../_lib/errors';
import { generateFarmDoctorAdvisory } from '../_lib/aiCore';

const num = (v: unknown, name: string, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new ApiError(400, 'INVALID_INPUT', `${name} is invalid.`);
  return n;
};

// POST /api/v1/advisory  { profile, weather|null }
export default handler(async ({ body }) => {
  const p = body.profile ?? {};
  const issues = Array.isArray(p.pastIssues) ? p.pastIssues.slice(0, 10).map((x: unknown) => str(x, 'pastIssues', 80)) : [];
  const profile = {
    ...p,
    district: str(p.district, 'district', 60, { required: false }),
    cropType: str(p.cropType, 'cropType', 60),
    sowingDate: isoDate(p.sowingDate, 'sowingDate'),
    soilType: str(p.soilType, 'soilType', 60),
    pastIssues: issues,
  };
  let weather = null;
  if (body.weather) {
    const w = body.weather;
    weather = {
      ...w,
      temperatureC: num(w.temperatureC, 'temperatureC', -50, 60),
      humidity: num(w.humidity, 'humidity', 0, 100),
      windKph: num(w.windKph, 'windKph', 0, 400),
      rainChancePercent: num(w.rainChancePercent, 'rainChancePercent', 0, 100),
      condition: str(w.condition, 'condition', 60),
    };
  }
  return generateFarmDoctorAdvisory(profile, weather);
}, { limitPerMinute: 10, requireAuth: true });

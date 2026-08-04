<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yYMPkBg1db4T1L0kToBXBnyJt7FC9wLK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Features

- **AI Crop Diagnosis** — photograph a Paddy/Millet leaf and get an instant disease/pest diagnosis with organic & chemical remedies, in English and Odia.
- **AI Farm Doctor** — set up a farm profile (district, crop, sowing date, soil type, past issues) and get a proactive weekly risk advisory that combines crop growth stage with live local weather.
- **Voice Assistant** — ask any farming question by typing or speaking; answers come back as text and speech, in Odia or English.
- **AI Crop Calendar** — enter a crop and sowing date, get an auto-generated fertilizer/irrigation/pest-watch/harvest timeline.
- **Profit Calculator** — enter land area, expected yield, price, and costs to see projected profit and break-even numbers.
- **Field Monitor** — save your field's GPS location today; laid out as the foundation for future satellite-based vegetation/moisture monitoring.
- **Scan History** — every diagnosis is saved locally for later reference.
- **Local weather & spray advisory**, **dark mode**, **installable PWA** with basic offline app-shell caching.

## Roadmap ideas (to further differentiate from Plantix / Kisan Suvidha)

- Satellite (NDVI) imagery integration for the Field Monitor once a provider (e.g. Sentinel Hub) API key is available
- Community Q&A / peer forum for farmers in the same district
- Live mandi (market) price feed integration
- SMS/IVR fallback for farmers without smartphones
- Multi-crop support beyond Paddy & Millet


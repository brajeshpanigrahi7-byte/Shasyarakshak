import { Language, UIContent } from './types';

export const UI_TRANSLATIONS: Record<Language, UIContent> = {
  [Language.ENGLISH]: {
    title: "Shasyarakshak",
    subtitle: "Crop Protector for Odisha",
    uploadButton: "Analyze Crop",
    analyzing: "Analyzing crop health...",
    results: "Diagnosis Report",
    severity: "Severity",
    confidence: "AI Confidence",
    organic: "Organic Solutions",
    chemical: "Chemical Controls",
    kvkContact: "Expert Support (KVK)",
    kvkLinkText: "Find nearest KVK Center",
    selectImage: "Upload Photo",
    takePhoto: "Take Photo",
    retry: "Analyze Another",
    home: "Home",
    kvkSearchLabel: "Find your nearest Krishi Vigyan Kendra",
    kvkSearchPlaceholder: "Search by District (e.g., Khordha)",
    phone: "Phone",
    email: "Email",
    address: "Address",
    callNow: "Call Now",
    noResults: "No KVK found for this district.",
    savedCenter: "My Preferred KVK",
    save: "Set as my KVK",
    remove: "Remove"
  },
  [Language.ODIA]: {
    title: "ଶସ୍ୟରକ୍ଷକ",
    subtitle: "ଓଡିଶାର କୃଷକମାନଙ୍କ ପାଇଁ",
    uploadButton: "ଫସଲ ପରୀକ୍ଷା କରନ୍ତୁ",
    analyzing: "ଫସଲ ରୋଗ ବିଶ୍ଳେଷଣ ଚାଲିଛି...",
    results: "ରୋଗ ନିର୍ଣ୍ଣୟ ରିପୋର୍ଟ",
    severity: "ପ୍ରଭାବ",
    confidence: "ନିଶ୍ଚିତତା",
    organic: "ଜୈବିକ ଉପଚାର",
    chemical: "ରାସାୟନିକ ନିୟନ୍ତ୍ରଣ",
    kvkContact: "ବିଶେଷଜ୍ଞ ସହାୟତା (KVK)",
    kvkLinkText: "ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର (KVK)",
    selectImage: "ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ",
    takePhoto: "ଫଟୋ ଉଠାନ୍ତୁ",
    retry: "ଅନ୍ୟ ଏକ ପରୀକ୍ଷା କରନ୍ତୁ",
    home: "ମୂଳ ପୃଷ୍ଠା",
    kvkSearchLabel: "ଆପଣଙ୍କ ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର ଖୋଜନ୍ତୁ",
    kvkSearchPlaceholder: "ଜିଲ୍ଲା ନାମ ଲେଖନ୍ତୁ (ଯେପରିକି ଖୋର୍ଦ୍ଧା)",
    phone: "ଫୋନ୍",
    email: "ଇମେଲ୍",
    address: "ଠିକଣା",
    callNow: "କଲ୍ କରନ୍ତୁ",
    noResults: "ଏହି ଜିଲ୍ଲା ପାଇଁ କୌଣସି KVK ମିଳିଲା ନାହିଁ।",
    savedCenter: "ମୋ ପସନ୍ଦର KVK",
    save: "ମୋ କେନ୍ଦ୍ର ଭାବେ ବାଛନ୍ତୁ",
    remove: "ହଟାନ୍ତୁ"
  }
};

export const SAMPLE_IMAGES = [
  "https://picsum.photos/seed/paddy/400/300",
  "https://picsum.photos/seed/millet/400/300"
];
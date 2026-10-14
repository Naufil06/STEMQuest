import { useSyncExternalStore } from "react";

export const LANGS: { id: string; label: string; rtl?: boolean }[] = [
  { id: "en", label: "English" }, { id: "fr", label: "Français" }, { id: "es", label: "Español" },
  { id: "ar", label: "العربية", rtl: true }, { id: "ur", label: "اردو", rtl: true }, { id: "zh", label: "中文" },
];
const KEYS = ["dashboard","subjects","worldMap","rewards","leaderboards","friends","progress","teacher","parent","settings","level","xp","difficulty","multiplier","listen","typeAnswer","check","correct","incorrect","answer","next","start","math","science","english","technology","welcome","language"] as const;
export type TKey = (typeof KEYS)[number];

// One pipe-separated row per language, in the same order as KEYS.
const ROWS: Record<string, string> = {
  en: "Dashboard|Subjects|World Map|Rewards|Leaderboards|Friends|Progress|Teacher View|Parent View|Settings|Level|XP|Difficulty|XP multiplier|Listen|Type your answer…|Check|Correct!|Not quite|Answer|Next|Start|Mathematics|Science|English|Technology|Welcome back,|Language",
  fr: "Tableau de bord|Matières|Carte du monde|Récompenses|Classements|Amis|Progrès|Vue enseignant|Vue parent|Paramètres|Niveau|XP|Difficulté|Multiplicateur XP|Écouter|Tapez votre réponse…|Vérifier|Correct !|Pas tout à fait|Réponse|Suivant|Commencer|Mathématiques|Sciences|Anglais|Technologie|Bon retour,|Langue",
  es: "Panel|Materias|Mapa del mundo|Recompensas|Clasificaciones|Amigos|Progreso|Vista del docente|Vista de padres|Ajustes|Nivel|XP|Dificultad|Multiplicador de XP|Escuchar|Escribe tu respuesta…|Comprobar|¡Correcto!|No exactamente|Respuesta|Siguiente|Empezar|Matemáticas|Ciencias|Inglés|Tecnología|Bienvenido de nuevo,|Idioma",
  ar: "لوحة التحكم|المواد|خريطة العالم|المكافآت|المتصدرون|الأصدقاء|التقدم|عرض المعلم|عرض الوالدين|الإعدادات|المستوى|نقاط الخبرة|الصعوبة|مضاعف النقاط|استمع|اكتب إجابتك…|تحقق|صحيح!|ليس تماماً|الإجابة|التالي|ابدأ|الرياضيات|العلوم|الإنجليزية|التكنولوجيا|مرحباً بعودتك،|اللغة",
  ur: "ڈیش بورڈ|مضامین|دنیا کا نقشہ|انعامات|لیڈر بورڈز|دوست|پیش رفت|استاد کا منظر|والدین کا منظر|ترتیبات|لیول|ایکس پی|مشکل|ایکس پی ضرب|سنیں|اپنا جواب لکھیں…|جانچیں|درست!|بالکل نہیں|جواب|اگلا|شروع کریں|ریاضی|سائنس|انگریزی|ٹیکنالوجی|خوش آمدید،|زبان",
  zh: "仪表板|科目|世界地图|奖励|排行榜|好友|进度|教师视图|家长视图|设置|等级|经验值|难度|经验倍数|朗读|输入你的答案…|检查|正确！|不太对|答案|下一题|开始|数学|科学|英语|技术|欢迎回来，|语言",
};
const DICT = Object.fromEntries(Object.entries(ROWS).map(([k, v]) => [k, v.split("|")]));

const LKEY = "stemquest-lang";
let lang = (() => { try { return localStorage.getItem(LKEY) || "en"; } catch { return "en"; } })();
const subs = new Set<() => void>();
export function setLang(l: string) {
  lang = l;
  try { localStorage.setItem(LKEY, l); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
export function useT() {
  const l = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => lang, () => "en");
  const t = (k: TKey) => DICT[l]?.[KEYS.indexOf(k)] ?? DICT.en[KEYS.indexOf(k)];
  return { t, lang: l };
}
const VOICE: Record<string, string> = { en: "en-US", fr: "fr-FR", es: "es-ES", ar: "ar-SA", ur: "ur-PK", zh: "zh-CN" };
export function speak(text: string, l: string) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = VOICE[l] ?? "en-US";
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}

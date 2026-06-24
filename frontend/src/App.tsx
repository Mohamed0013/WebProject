import { isAxiosError } from "axios";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "./api";
import type { AdminOrder, OrderResponse, Perfume, User } from "./types";
import APLogo from "./pictures/AP.png";
import BlueImage from "./pictures/Blue.png";
import BossImage from "./pictures/Boss.jpeg";
import ImaginationImage from "./pictures/Imagination.png";
import InvictusImage from "./pictures/Invectus.png";
import LHommeImage from "./pictures/LHOME.png";
import LightBlueImage from "./pictures/LightBlue.png";
import PackEliteHarmonyImage from "./pictures/pack3/pack-elite-harmony.png";
import PackHarmonieImage from "./pictures/pack3/pack-harmonie.png";
import WantedImage from "./pictures/Wanted.jpeg";
import YImage from "./pictures/Y.jpeg";
import SauvageImage from "./pictures/sauvage.jpeg";
import YouImage from "./pictures/You.png";
import VersaceErosImage from "./pictures/VersaceEros.jpeg";
import BiancolatteImage from "./pictures/Biancolatte.jpg";
import ErbapuraImage from "./pictures/Erbapura.jpg";
import HomeinstantImage from "./pictures/Homeinstant.jpg";
import LinstantGuirlanImage from "./pictures/L'instantGuirlan.jpg";
import LacostImage from "./pictures/Lacost.png";

type AdminLoginForm = {
  email: string;
  password: string;
};

type GuestOrderForm = {
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  quantity: number;
  purchase_option: PurchaseOption;
};

const tokenStorageKey = "perfume-admin-token";
const languageStorageKey = "perfume-language";

type Language = "fr" | "ar";

type PurchaseOption = "pack_30ml_x4" | "single_50ml" | "pack_50ml_x3";

type CartItem = {
  key: string;
  perfumeId: number;
  perfumeName: string;
  perfumeSlug: string;
  routePath?: string;
  imageUrl: string | null;
  purchaseOption: PurchaseOption;
  quantity: number;
  unitPrice: number;
};

const purchaseOptionLabels: Record<PurchaseOption, { fr: string; ar: string }> = {
  pack_30ml_x4: { fr: "Pack 30ml x4 (149 DH)", ar: "باك 30 مل × 4 (149 درهم)" },
  single_50ml: { fr: "50ml (1 bouteille) 79 DH", ar: "50 مل (زجاجة واحدة) 79 درهم" },
  pack_50ml_x3: { fr: "Pack 50ml x3 (179 DH)", ar: "باك 50 مل × 3 (179 درهم)" },
};

const ingredientArabicMap: Record<string, string> = {
  lemon: "ليمون",
  bergamot: "برغموت",
  citrus: "حمضيات",
  mandarin: "يوسفي",
  orange: "برتقال",
  grapefruit: "جريب فروت",
  mint: "نعناع",
  pepper: "فلفل",
  cardamom: "هيل",
  saffron: "زعفران",
  rose: "ورد",
  peony: "فاوانيا",
  violet: "بنفسج",
  floral: "زهري",
  lavender: "خزامى",
  tea: "شاي",
  sage: "ميرمية",
  vanilla: "فانيلا",
  tonka: "تونكا",
  bean: "حبوب",
  amber: "عنبر",
  musk: "مسك",
  sandalwood: "خشب الصندل",
  cedar: "أرز",
  wood: "خشب",
  patchouli: "باتشولي",
  vetiver: "فيتيفر",
  oud: "عود",
  incense: "بخور",
  resin: "راتنج",
  leather: "جلد",
  pear: "كمثرى",
  lychee: "ليتشي",
  fruit: "فاكهة",
  jasmine: "ياسمين",
  iris: "سوسن",
  neroli: "نيرولي",
  almond: "لوز",
  coconut: "جوز الهند",
  cherry: "كرز",
  plum: "برقوق",
  apple: "تفاح",
  pineapple: "أناناس",
  fig: "تين",
  raspberry: "توت العليق",
  strawberry: "فراولة",
  blackcurrant: "كشمش أسود",
  cinnamon: "قرفة",
  clove: "قرنفل",
  ginger: "زنجبيل",
  tobacco: "تبغ",
  cacao: "كاكاو",
  chocolate: "شوكولاتة",
  caramel: "كراميل",
  honey: "عسل",
  rum: "روم",
  whiskey: "ويسكي",
  moss: "طحلب",
  oakmoss: "طحلب السنديان",
  aldehydes: "ألدهيدات",
  aquatic: "مائي",
  salty: "ملحي",
};

const perfumeImageBySlug: Record<string, string> = {
  "bleu-chanel": BlueImage,
  "boss-bottled": BossImage,
  "dolce-gabbana-light-blue": LightBlueImage,
  imagination: ImaginationImage,
  invictus: InvictusImage,
  "l-homme-ysl": LHommeImage,
  "azzaro-wanted": WantedImage,
  "y-eau-de-parfum": YImage,
  "dior-sauvage": SauvageImage,
  "stronger-with-you": YouImage,
  "versace-eros": VersaceErosImage,
  "bianco-latte": BiancolatteImage,
  "erba-pura": ErbapuraImage,
  "dior-homme-intense": HomeinstantImage,
  "l-instant-de-guerlain": LinstantGuirlanImage,
  "lacoste-blanc": LacostImage,
};

const homeFeaturedSlugs = [
  "imagination",
  "y-eau-de-parfum",
  "boss-bottled",
  "versace-eros",
];

type SeasonKey = "all" | "printemps" | "ete" | "automne" | "hiver";

const seasonLabels: Record<SeasonKey, { fr: string; ar: string }> = {
  all: { fr: "Toutes saisons", ar: "كل الفصول" },
  printemps: { fr: "Printemps", ar: "الربيع" },
  ete: { fr: "Été", ar: "الصيف" },
  automne: { fr: "Automne", ar: "الخريف" },
  hiver: { fr: "Hiver", ar: "الشتاء" },
};

type PackShowcaseItem = {
  id: string;
  image: string;
  perfumeSlug: string;
  purchaseOption: PurchaseOption;
  includedSlugs: string[];
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  detailsFr: string;
  detailsAr: string;
  price: number;
};

const packShowcaseItems: PackShowcaseItem[] = [
  {
    id: "pack-30ml-quad",
    image: PackHarmonieImage,
    perfumeSlug: "versace-eros",
    purchaseOption: "pack_30ml_x4",
    includedSlugs: ["versace-eros", "dior-sauvage", "y-eau-de-parfum"],
    titleFr: "Pack 30ml x4",
    titleAr: "باك 30مل × 4",
    descriptionFr: "4 parfums 30ml pour 149 DH.",
    descriptionAr: "4 عطور 30مل بـ 149 درهم.",
    detailsFr: "Pack de 4 parfums au format 30ml. Parfait pour varier chaque jour.",
    detailsAr: "باك 4 عطور بحجم 30مل. مثالي لتنويع الروائح يوميا.",
    price: 149,
  },
  {
    id: "pack-50ml-trio",
    image: PackEliteHarmonyImage,
    perfumeSlug: "imagination",
    purchaseOption: "pack_50ml_x3",
    includedSlugs: ["imagination", "l-homme-ysl", "erba-pura"],
    titleFr: "Pack 50ml Trio",
    titleAr: "باك 50مل ثلاثي",
    descriptionFr: "3 parfums 50ml differents pour 179 DH.",
    descriptionAr: "3 عطور 50مل مختلفة بـ 179 درهم.",
    detailsFr: "Trois parfums 50ml pour un choix complet au quotidien.",
    detailsAr: "ثلاث عطور 50مل لاختيارات يومية متكاملة.",
    price: 179,
  },
];

function resolvePerfumeImage(perfume: Pick<Perfume, "slug" | "image_url">) {
  return perfumeImageBySlug[perfume.slug] ?? perfume.image_url;
}

function splitBilingualText(value: string) {
  const parts = value.split("||").map((part) => part.trim());
  if (parts.length < 2) {
    return null;
  }

  return {
    fr: parts[0],
    ar: parts.slice(1).join(" || "),
  };
}

function localizePerfumeText(value: string, isArabic: boolean) {
  const bilingual = splitBilingualText(value);
  if (!bilingual) {
    return value;
  }

  return isArabic ? bilingual.ar : bilingual.fr;
}

function translateIngredientToArabic(ingredient: string) {
  return ingredient
    .split(/([,()\-\/]|\s+)/)
    .map((part) => {
      const key = part.toLowerCase().trim();
      if (!key) {
        return part;
      }

      return ingredientArabicMap[key] ?? part;
    })
    .join("");
}

function localizePerfumeNote(note: string, isArabic: boolean) {
  const bilingual = splitBilingualText(note);
  if (bilingual) {
    return isArabic ? bilingual.ar : bilingual.fr;
  }

  return isArabic ? translateIngredientToArabic(note) : note;
}

function masterQualityLabel(t: (english: string, arabic: string) => string) {
  return t("Master qualite", "جودة ماستر");
}

function masterQualityDisclaimer(t: (english: string, arabic: string) => string) {
  return t(
    "Master qualite: parfum inspire de tres haute qualite (non original).",
    "جودة ماستر: عطر مستوحى بجودة عالية جدا (غير أصلي).",
  );
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  isArabic: boolean;
  t: (english: string, arabic: string) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "fr",
  setLanguage: () => undefined,
  isArabic: false,
  t: (english) => english,
});

function useLanguage() {
  return useContext(LanguageContext);
}

function Currency({ amount }: { amount: number }) {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar-MA" : "fr-MA";

  return <>{new Intl.NumberFormat(locale, { style: "currency", currency: "MAD" }).format(amount)}</>;
}

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-stone-200 bg-white/90 px-6 py-5 shadow-lg dark:border-stone-700 dark:bg-stone-900/90">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/60" />
          <span className="inline-flex h-12 w-12 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-700 dark:text-stone-200">{label}</p>
      </div>
    </div>
  );
}

type StorefrontPageMode = "home" | "parfumes" | "offres" | "marques" | "packs";

type StorefrontPageProps = {
  mode: StorefrontPageMode;
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
  hideEmptyCartPrompt: boolean;
  setHideEmptyCartPrompt: (value: boolean) => void;
};

function StorefrontPage({ mode, cartItems, isCartOpen, setIsCartOpen, hideEmptyCartPrompt, setHideEmptyCartPrompt }: StorefrontPageProps) {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<SeasonKey>("all");
  const [selectedCategory, setSelectedCategory] = useState<"parfums" | "packs" | "markes" | "saisons">(() => {
    if (mode === "packs") {
      return "packs";
    }

    if (mode === "marques") {
      return "markes";
    }

    return "parfums";
  });

  useEffect(() => {
    const state = location.state as { successMessage?: string } | null;
    if (!state?.successMessage) {
      return;
    }

    setSuccessMessage(state.successMessage);
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  }, [location.state]);

  useEffect(() => {
    void api.get<Perfume[]>("/perfumes")
      .then((response) => setPerfumes(response.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mode === "packs") {
      setSelectedCategory("packs");
      return;
    }

    if (mode === "marques") {
      setSelectedCategory("markes");
      return;
    }

    setSelectedCategory("parfums");
  }, [mode]);

  const searchedPerfumes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let filtered = perfumes;

    // Filter by season if a specific season is selected
    if (selectedCategory === "saisons" && selectedSeason !== "all") {
      filtered = filtered.filter((perfume) => {
        return perfume.seasons && perfume.seasons.includes(selectedSeason);
      });
    }

    // Filter by search term
    if (normalizedSearch.length > 0) {
      filtered = filtered.filter((perfume) => {
        const searchable = [perfume.name, perfume.brand, perfume.short_description, perfume.fragrance_family].join(" ").toLowerCase();
        return searchable.includes(normalizedSearch);
      });
    }

    return filtered;
  }, [perfumes, searchTerm, selectedSeason, selectedCategory]);

  const offerPerfumes = useMemo(
    () => searchedPerfumes.filter((perfume) => perfume.is_best_seller || perfume.is_trending),
    [searchedPerfumes],
  );
  const offerTickerMessages = useMemo(() => {
    const defaults = [
      t("50ml a 79 DH", "50 مل بـ 79 درهم"),
      t("Pack 30ml x4 a 149 DH", "باك 30مل × 4 بـ 149 درهم"),
      t("Pack 50ml x3 a 179 DH", "باك 50مل × 3 بـ 179 درهم"),
      t("Livraison gratuite partout au Maroc", "توصيل مجاني في كل المغرب"),
    ];

    const dynamicOffers = offerPerfumes
      .slice(0, 8)
      .map((perfume) => {
        if (perfume.is_best_seller) {
          return t(`Best seller: ${perfume.name}`, `الأكثر مبيعاً: ${perfume.name}`);
        }

        return t(`Tendance: ${perfume.name}`, `رائج الآن: ${perfume.name}`);
      });

    return dynamicOffers.length > 0 ? dynamicOffers : defaults;
  }, [offerPerfumes, t]);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);

  const brands = useMemo(() => Array.from(new Set(perfumes.map((perfume) => perfume.brand))).sort((a, b) => a.localeCompare(b)), [perfumes]);

  useEffect(() => {
    setActiveOfferIndex(0);
  }, [offerTickerMessages.length]);

  useEffect(() => {
    if (offerTickerMessages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveOfferIndex((current) => (current + 1) % offerTickerMessages.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [offerTickerMessages.length]);

  const visiblePerfumes = useMemo(() => {
    const source = mode === "offres" ? offerPerfumes : searchedPerfumes;

    if (selectedCategory === "markes" && selectedBrand.length > 0) {
      return source.filter((perfume) => perfume.brand === selectedBrand);
    }

    if (mode !== "home") {
      return source;
    }

    const featured = source.filter((perfume) => homeFeaturedSlugs.includes(perfume.slug));
    const featuredSlugSet = new Set(featured.map((perfume) => perfume.slug));
    const rest = source.filter((perfume) => !featuredSlugSet.has(perfume.slug));

    featured.sort((a, b) => homeFeaturedSlugs.indexOf(a.slug) - homeFeaturedSlugs.indexOf(b.slug));

    return [...featured, ...rest];
  }, [mode, offerPerfumes, searchedPerfumes, selectedBrand, selectedCategory]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const headingByMode: Record<StorefrontPageMode, string> = {
    home: t("Nos parfums", "عطورنا"),
    parfumes: t("Collection parfums", "مجموعة العطور"),
    offres: t("Offres speciales", "العروض الخاصة"),
    marques: t("Marques", "الماركات"),
    packs: t("Nos Packs", "باقاتنا"),
  };
  const offersQualityHeader = t(
    "Nous nous distinguons par la conception de parfums de haute qualite en utilisant des huiles parfumees concentrees et originales. Puissance, projection et tenue de plus de quatre heures.",
    "نتميز عن غيرنا بتصميم عطور بجودة عالية عن طريق استعمال زيوت عطرية مركزة وأصلية. قوة, فوحان, ثبات يدوم لأكثر من أربع ساعات",
  );

  const seasonKeys: SeasonKey[] = ["all", "printemps", "ete", "automne", "hiver"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff2d5_0%,_#fef3e2_32%,_#f5f5f4_100%)] px-3 pb-8 pt-3 text-stone-900 dark:bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#111827_45%,_#020617_100%)] dark:text-stone-100 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-full border border-amber-200 bg-amber-100/90 px-4 py-2 text-center text-[11px] font-semibold tracking-[0.08em] text-amber-950 shadow-sm dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
          <span className="mr-2 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-900 dark:bg-amber-700/70 dark:text-amber-100">{t("Offres", "العروض")}</span>
          <span key={`${activeOfferIndex}-${offerTickerMessages[activeOfferIndex]}`} className="inline-block min-h-[1.2em] align-middle">
            {offerTickerMessages[activeOfferIndex]}
          </span>
        </div>
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] font-medium leading-6 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100">
          {offersQualityHeader}
        </p>

        <div className="mt-3 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-lg dark:border-stone-700 dark:bg-stone-900/95">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="inline-flex items-center">
              <img src={APLogo} alt="AP" className="h-11 w-auto" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-0.5 rounded-full border border-stone-300 bg-white p-0.5 text-[10px] font-semibold text-stone-800">
                <button
                  type="button"
                  onClick={() => setLanguage("fr")}
                  className={`rounded-full px-2 py-0.5 transition ${language === "fr" ? "bg-stone-900 text-white" : "text-stone-700"}`}
                  aria-pressed={language === "fr"}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ar")}
                  className={`rounded-full px-2 py-0.5 transition ${language === "ar" ? "bg-stone-900 text-white" : "text-stone-700"}`}
                  aria-pressed={language === "ar"}
                >
                  AR
                </button>
              </div>

              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800"
              >
                {t("Admin", "المشرف")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-800 dark:border-stone-600 dark:text-stone-100"
              >
                {t("Panier", "السلة")}
                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] text-white dark:bg-stone-100 dark:text-stone-900">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>

        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/35 p-3" onClick={() => setIsCartOpen(false)}>
            <div className="ml-auto h-full w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl dark:bg-stone-900" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-600 dark:text-stone-300">{t("Votre panier", "سلة المشتريات")}</p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                >
                  X
                </button>
              </div>

              {cartItems.length === 0 ? (
                !hideEmptyCartPrompt ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <div className="flex items-start justify-between gap-2">
                      <p>{t("Votre panier est vide", "سلتك فارغة")}</p>
                      <button
                        type="button"
                        onClick={() => setHideEmptyCartPrompt(true)}
                        className="rounded-full border border-amber-300 px-2 py-0.5 text-xs"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-stone-500 dark:text-stone-300">{t("Aucun article ajoute.", "لا توجد عناصر مضافة.")}</p>
                )
              ) : (
                <div className="mt-4 space-y-3">
                  {cartItems.map((item) => (
                    <Link
                      key={item.key}
                      to={item.routePath ?? `/perfume/${item.perfumeSlug}`}
                      onClick={() => {
                        setIsCartOpen(false);
                      }}
                      className="block rounded-xl border border-stone-200 p-3 text-sm transition hover:border-amber-300 hover:bg-amber-50/40 dark:border-stone-700 dark:hover:border-amber-600 dark:hover:bg-stone-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">{item.perfumeName}</p>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">{t("Voir", "عرض")}</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300">{t(purchaseOptionLabels[item.purchaseOption].fr, purchaseOptionLabels[item.purchaseOption].ar)}</p>
                      <p className="text-xs text-stone-600 dark:text-stone-300">{t("Quantite", "الكمية")}: {item.quantity}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 rounded-2xl border border-stone-200 bg-white/90 p-3 shadow-sm dark:border-stone-700 dark:bg-stone-900/90">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("Rechercher un parfum, marque, note...", "ابحث عن عطر أو ماركة أو نغمة...")}
            className="w-full rounded-xl border border-stone-300 p-3 text-sm dark:border-stone-600 dark:bg-stone-800"
          />
          <div className="mt-3 grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("parfums")}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${selectedCategory === "parfums" ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900" : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"}`}
            >
              parfums
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("packs")}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${selectedCategory === "packs" ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900" : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"}`}
            >
              packs
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("saisons")}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${selectedCategory === "saisons" ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900" : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"}`}
            >
              {t("saisons", "الفصول")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("markes")}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${selectedCategory === "markes" ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900" : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"}`}
            >
              marques
            </button>
          </div>
        </div>

        {selectedCategory === "saisons" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {seasonKeys.map((seasonKey) => (
              <button
                key={seasonKey}
                type="button"
                onClick={() => setSelectedSeason(seasonKey)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedSeason === seasonKey ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-900"}`}
              >
                {t(seasonLabels[seasonKey].fr, seasonLabels[seasonKey].ar)}
              </button>
            ))}
          </div>
        )}

        {selectedCategory === "markes" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedBrand("")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedBrand.length === 0 ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-900"}`}
            >
              {t("Toutes", "الكل")}
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setSelectedBrand(brand)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedBrand === brand ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-900"}`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {selectedCategory !== "packs" && (
        <section className="mt-4">
          <h1 className="mb-3 text-xl font-semibold sm:text-2xl">
            {selectedCategory === "markes" ? t("Marques", "الماركات") :
             selectedCategory === "saisons" ? t(seasonLabels[selectedSeason].fr, seasonLabels[selectedSeason].ar) :
             headingByMode[mode]}
          </h1>
          {mode === "offres" && (
            <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-6 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100">
              {offersQualityHeader}
            </p>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {successMessage}
            </div>
          )}

          {loading ? (
            <FullScreenLoader label={t("Chargement des parfums...", "جاري تحميل العطور...")} />
          ) : visiblePerfumes.length === 0 ? (
            <p className="rounded-2xl bg-white p-5 text-sm text-stone-600 shadow dark:bg-stone-900 dark:text-stone-300">{t("Aucun parfum trouve.", "لم يتم العثور على عطور.")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {visiblePerfumes.map((perfume) => (
                <Link
                  key={perfume.id}
                  to={`/perfume/${perfume.slug}`}
                  className="group relative block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-stone-700 dark:bg-stone-900"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-200 dark:bg-stone-800">
                    {resolvePerfumeImage(perfume) ? (
                      <img src={resolvePerfumeImage(perfume) ?? ""} alt={perfume.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-stone-500">{t("Pas d'image", "لا توجد صورة")}</div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{perfume.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-300">{localizePerfumeText(perfume.brand, language === "ar")}</p>
                    <p className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-800">
                      {masterQualityLabel(t)}
                    </p>
                    <p className="text-xs font-semibold text-amber-800"><Currency amount={perfume.price} /></p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        )}

        {selectedCategory === "packs" && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold sm:text-xl">{t("Nos Packs", "باقاتنا")}</h2>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800">
                {t("Offres pack", "عروض الباك")}
              </span>
            </div>
            <p className="mb-4 text-xs text-stone-600 dark:text-stone-300">
              {t("Choisissez un pack pret a commander avec des prix fixes et avantageux.", "اختر باكا جاهزا للطلب بأسعار ثابتة ومميزة.")}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {packShowcaseItems.map((pack) => (
                <Link
                  key={pack.id}
                  to={`/pack/${pack.id}`}
                  className="block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-700 dark:bg-stone-900"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-200 dark:bg-stone-800">
                    <img src={pack.image} alt={t(pack.titleFr, pack.titleAr)} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="text-sm font-semibold leading-snug">{t(pack.titleFr, pack.titleAr)}</p>
                    <p className="text-xs text-stone-600 dark:text-stone-300">{t(pack.descriptionFr, pack.descriptionAr)}</p>
                    <p className="text-xs font-semibold text-amber-800"><Currency amount={pack.price} /></p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PackOrderPage({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  const { t, isArabic } = useLanguage();
  const navigate = useNavigate();
  const { packId = "" } = useParams();
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const pack = useMemo(() => packShowcaseItems.find((item) => item.id === packId) ?? null, [packId]);

  useEffect(() => {
    void api.get<Perfume[]>("/perfumes")
      .then((response) => setCatalog(response.data))
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, []);

  const includedPerfumes = useMemo(() => {
    if (!pack) {
      return [];
    }

    return pack.includedSlugs
      .map((slug) => catalog.find((perfume) => perfume.slug === slug))
      .filter((perfume): perfume is Perfume => perfume !== undefined);
  }, [catalog, pack]);

  const representativePerfume = useMemo(() => {
    if (!pack) {
      return null;
    }

    return includedPerfumes.find((perfume) => perfume.slug === pack.perfumeSlug) ?? includedPerfumes[0] ?? null;
  }, [includedPerfumes, pack]);

  const unitPrice = pack?.price ?? 0;
  const total = unitPrice * quantity;

  const handleAddPackToCart = () => {
    if (!pack) {
      return;
    }

    onAddToCart({
      key: `pack-${pack.id}`,
      perfumeId: representativePerfume?.id ?? 0,
      perfumeName: t(pack.titleFr, pack.titleAr),
      perfumeSlug: representativePerfume?.slug ?? pack.perfumeSlug,
      routePath: `/pack/${pack.id}`,
      imageUrl: pack.image,
      purchaseOption: pack.purchaseOption,
      quantity,
      unitPrice,
    });

    setMessage(t("Pack ajoute au panier.", "تمت إضافة الباك إلى السلة."));
  };

  const handleBuyNow = () => {
    if (!pack) {
      return;
    }

    navigate(`/perfume/${representativePerfume?.slug ?? pack.perfumeSlug}`, {
      state: {
        preselectedPurchaseOption: pack.purchaseOption,
      },
    });
  };

  if (loading) {
    return <FullScreenLoader label={t("Chargement du pack...", "جاري تحميل الباك...")} />;
  }

  if (!pack) {
    return (
      <div className="mx-auto max-w-xl p-8 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <p className="text-lg font-medium">{t("Pack introuvable.", "الباك غير موجود.")}</p>
        <Link to="/parfumes" className="mt-4 inline-flex rounded-full bg-stone-900 px-4 py-2 text-white dark:bg-stone-100 dark:text-stone-900">{t("Retour au catalogue", "العودة إلى الكتالوج")}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fef7ed_0%,_#fffaf0_40%,_#f5f5f4_100%)] px-4 pb-16 pt-10 dark:bg-[linear-gradient(135deg,_#0f172a_0%,_#111827_42%,_#1f2937_100%)] sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-6">
          <Link to="/parfumes" className="text-sm text-amber-700 hover:underline dark:text-amber-300">{t("Retour au catalogue", "العودة إلى الكتالوج")}</Link>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 sm:text-3xl">{t(pack.titleFr, pack.titleAr)}</h1>
          <p className="text-sm text-stone-600 dark:text-stone-300">{t(pack.descriptionFr, pack.descriptionAr)}</p>
          <p className="rounded-2xl bg-stone-50 p-3 text-sm leading-7 text-stone-700 dark:bg-stone-800 dark:text-stone-200">{t(pack.detailsFr, pack.detailsAr)}</p>
          <div className="overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
            <img src={pack.image} alt={t(pack.titleFr, pack.titleAr)} className="h-full w-full object-cover" />
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">{t("Contenu du pack", "محتوى الباك")}</p>
            <div className="mt-3 space-y-2">
              {includedPerfumes.length === 0 ? (
                <p className="text-sm text-stone-600 dark:text-stone-300">{t("Contenu detaille indisponible pour le moment.", "تفاصيل المحتوى غير متاحة حالياً.")}</p>
              ) : (
                includedPerfumes.map((perfume) => (
                  <Link key={perfume.slug} to={`/perfume/${perfume.slug}`} className="block rounded-xl border border-stone-200 p-2 text-sm hover:border-amber-300 dark:border-stone-700">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{perfume.name}</p>
                    <p className="text-xs text-stone-600 dark:text-stone-300">{localizePerfumeText(perfume.brand, isArabic)}</p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-6">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{t("Option selectionnee", "العرض المختار")}</p>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">{t(purchaseOptionLabels[pack.purchaseOption].fr, purchaseOptionLabels[pack.purchaseOption].ar)}</p>

            <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {t("Prix unitaire:", "سعر الوحدة:")} <span className="font-semibold"><Currency amount={unitPrice} /></span>
            </div>
            <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {t("Total:", "المجموع:")} <span className="font-semibold"><Currency amount={total} /></span>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-300">{t("Quantite", "الكمية")}</label>
              <input
                className="w-full rounded-xl border border-stone-300 p-2.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddPackToCart}
                className="rounded-xl border border-stone-900 p-3 text-sm font-medium text-stone-900 hover:bg-stone-100 dark:border-stone-300 dark:text-stone-100 dark:hover:bg-stone-800"
              >
                {t("Ajouter au panier", "أضف إلى السلة")}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="rounded-xl bg-stone-900 p-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                {t("Acheter maintenant", "اشترِ الآن")}
              </button>
            </div>

            {message && <p className="mt-3 text-sm text-stone-700 dark:text-stone-300">{message}</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}

function PerfumePyramid({ perfume }: { perfume: Perfume }) {
  const { t, isArabic } = useLanguage();

  const ingredientImage = (ingredient: string, palette: "amber" | "orange" | "rose") => {
    const lower = localizePerfumeNote(ingredient, false).toLowerCase();

    const ingredientPhotos: Array<{ keywords: string[]; url: string }> = [
      { keywords: ["lemon"], url: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["bergamot", "citrus"], url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["mandarin", "orange"], url: "https://images.unsplash.com/photo-1611080626969-09d3b4d5ccf1?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["grapefruit"], url: "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["mint"], url: "https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["pepper"], url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["cardamom"], url: "https://images.unsplash.com/photo-1609501676725-7186f7346a6b?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["saffron"], url: "https://images.unsplash.com/photo-1596040032219-8f8d82f0bd24?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["rose"], url: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["peony", "violet", "floral"], url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["lavender"], url: "https://images.unsplash.com/photo-1597848212624-e6ec2f0f8460?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["tea"], url: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["sage"], url: "https://images.unsplash.com/photo-1618375569909-3c8616cf7731?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["vanilla"], url: "https://images.unsplash.com/photo-1603431770783-0f8619fe6b1f?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["tonka", "bean"], url: "https://images.unsplash.com/photo-1614977645540-7abd88ba8e56?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["amber"], url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["musk"], url: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["sandalwood", "cedar", "wood"], url: "https://images.unsplash.com/photo-1616627457668-0c6d6b3b4f84?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["patchouli", "vetiver"], url: "https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["oud", "incense", "resin"], url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["leather"], url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80" },
      { keywords: ["pear", "lychee", "fruit"], url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=200&q=80" },
    ];

    const matched = ingredientPhotos.find((photo) => photo.keywords.some((keyword) => lower.includes(keyword)));
    if (matched) {
      return matched.url;
    }

    const backgrounds: Record<"amber" | "orange" | "rose", string> = {
      amber: "FDE68A",
      orange: "FED7AA",
      rose: "FECDD3",
    };

    const colors: Record<"amber" | "orange" | "rose", string> = {
      amber: "7C2D12",
      orange: "9A3412",
      rose: "9F1239",
    };

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(ingredient)}&background=${backgrounds[palette]}&color=${colors[palette]}&size=96&bold=true`;
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-300">{t("Pyramide du parfum", "هرم العطر")}</p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <div
          className="w-[52%] max-w-[270px] bg-amber-100 px-6 py-4 text-center dark:bg-amber-900/45"
          style={{ clipPath: "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-900">{t("Notes de tete", "المقدمة")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {perfume.top_notes.map((note) => (
              <div key={`top-${note}`} className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 dark:bg-stone-900/50">
                <img src={ingredientImage(note, "amber")} alt={localizePerfumeNote(note, isArabic)} className="h-6 w-6 rounded-full border border-amber-300 object-cover" />
                <span className="text-[11px] font-medium text-stone-800 dark:text-stone-100">{localizePerfumeNote(note, isArabic)}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="w-[76%] max-w-[390px] bg-orange-100 px-8 py-4 text-center dark:bg-orange-900/45"
          style={{ clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-900">{t("Notes de coeur", "قلب العطر")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {perfume.heart_notes.map((note) => (
              <div key={`heart-${note}`} className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 dark:bg-stone-900/50">
                <img src={ingredientImage(note, "orange")} alt={localizePerfumeNote(note, isArabic)} className="h-6 w-6 rounded-full border border-orange-300 object-cover" />
                <span className="text-[11px] font-medium text-stone-800 dark:text-stone-100">{localizePerfumeNote(note, isArabic)}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="w-full max-w-[520px] bg-rose-100 px-8 py-4 text-center dark:bg-rose-900/45"
          style={{ clipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-rose-900">{t("Notes de fond", "القاعدة")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {perfume.base_notes.map((note) => (
              <div key={`base-${note}`} className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 dark:bg-stone-900/50">
                <img src={ingredientImage(note, "rose")} alt={localizePerfumeNote(note, isArabic)} className="h-6 w-6 rounded-full border border-rose-300 object-cover" />
                <span className="text-[11px] font-medium text-stone-800 dark:text-stone-100">{localizePerfumeNote(note, isArabic)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PerfumeOrderPage({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  const { t, isArabic } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug = "" } = useParams();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPurchaseSectionVisible, setIsPurchaseSectionVisible] = useState(false);
  const purchaseSectionRef = useRef<HTMLElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<GuestOrderForm>({
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    quantity: 1,
    purchase_option: "single_50ml",
  });

  useEffect(() => {
    setLoading(true);
    setMessage("");

    void api.get<Perfume>(`/perfumes/${slug}`)
      .then((response) => setPerfume(response.data))
      .catch(() => setPerfume(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    void api.get<Perfume[]>("/perfumes")
      .then((response) => setCatalog(response.data))
      .catch(() => setCatalog([]));
  }, []);

  const productMeta = useMemo(() => {
    if (!perfume) {
      return null;
    }

    return {
      brand: perfume.brand,
      gender: perfume.gender,
      sizes: perfume.size_options,
      stockStatus: perfume.stock_status,
      fragranceFamily: perfume.fragrance_family,
      longevity: perfume.longevity,
      sillage: perfume.sillage,
      vibe: perfume.vibe,
      whenToWear: perfume.when_to_wear,
      feeling: perfume.feeling,
      ingredients: perfume.ingredients,
      shipping: perfume.delivery_info,
      returns: perfume.return_policy,
      authenticity: perfume.authenticity_guarantee,
      rating: perfume.average_rating,
      reviewCount: perfume.reviews_count,
      reviews: perfume.reviews,
      isBestSeller: perfume.is_best_seller,
      isTrending: perfume.is_trending,
      similarSlugs: perfume.similar_slugs,
    };
  }, [perfume]);

  const preselectedPurchaseOption = useMemo(() => {
    const state = location.state as { preselectedPurchaseOption?: PurchaseOption } | null;
    const option = state?.preselectedPurchaseOption;
    if (!option) {
      return null;
    }

    return (Object.prototype.hasOwnProperty.call(purchaseOptionLabels, option) ? option : null) as PurchaseOption | null;
  }, [location.state]);

  useEffect(() => {
    if (!productMeta) {
      return;
    }

    setForm((current) => ({ ...current, purchase_option: preselectedPurchaseOption ?? "single_50ml" }));
  }, [productMeta, preselectedPurchaseOption]);

  const mediaItems = useMemo(() => {
    if (!perfume) {
      return [];
    }

    const fallbackImage = resolvePerfumeImage(perfume);

    return [
      { label: "Flacon", image: perfume.bottle_images[0] ?? fallbackImage, tone: "from-amber-200 to-amber-50" },
      { label: "Emballage", image: perfume.packaging_images[0] ?? fallbackImage, tone: "from-rose-200 to-rose-50" },
      { label: "Style de vie", image: perfume.lifestyle_images[0] ?? fallbackImage, tone: "from-stone-300 to-stone-100" },
    ];
  }, [perfume]);

  const relatedPerfumes = useMemo(() => {
    if (!perfume || !productMeta) {
      return [];
    }

    const similarBySlug = catalog.filter((item) => productMeta.similarSlugs.includes(item.slug));
    if (similarBySlug.length > 0) {
      return similarBySlug.slice(0, 3);
    }

    return catalog.filter((item) => item.id !== perfume.id).slice(0, 3);
  }, [catalog, perfume, productMeta]);

  const unitPrice = useMemo(() => {
    if (!perfume) {
      return 0;
    }

    const prices: Record<PurchaseOption, number> = {
      pack_30ml_x4: 149,
      single_50ml: 79,
      pack_50ml_x3: 179,
    };

    return prices[form.purchase_option];
  }, [perfume, form.purchase_option]);

  const total = useMemo(() => unitPrice * form.quantity, [unitPrice, form.quantity]);

  const handleAddToCart = () => {
    if (!perfume) {
      return;
    }

    onAddToCart({
      key: `${perfume.id}-${form.purchase_option}`,
      perfumeId: perfume.id,
      perfumeName: perfume.name,
      perfumeSlug: perfume.slug,
      imageUrl: resolvePerfumeImage(perfume),
      purchaseOption: form.purchase_option,
      quantity: form.quantity,
      unitPrice,
    });

    const optionLabel = t(
      purchaseOptionLabels[form.purchase_option].fr,
      purchaseOptionLabels[form.purchase_option].ar,
    );
    setMessage(t(
      `${perfume.name} (${optionLabel}) ajoute au panier.`,
      `${perfume.name} (${optionLabel}) تمت إضافته إلى السلة.`,
    ));
  };

  const handleBuyNow = () => {
    purchaseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 400);
  };

  useEffect(() => {
    const target = purchaseSectionRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPurchaseSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, perfume?.id]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!perfume) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await api.post<OrderResponse>("/orders", {
        perfume_id: perfume.id,
        customer_name: form.customer_name,
        customer_address: form.customer_address,
        customer_phone: form.customer_phone,
        quantity: form.quantity,
        purchase_option: form.purchase_option,
      });

      navigate("/", {
        replace: true,
        state: { successMessage: `${response.data.message} Votre commande a ete creee.` },
      });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const firstError = error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat()[0]
          : undefined;

        setMessage(typeof firstError === "string" ? firstError : error.response?.data?.message || "Echec de la commande.");
      } else {
        setMessage("Echec de la commande.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FullScreenLoader label={t("Chargement du parfum...", "جاري تحميل العطر...")} />;
  }

  if (!perfume) {
    return (
      <div className="mx-auto max-w-xl p-8 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <p className="text-lg font-medium">Parfum introuvable.</p>
        <Link to="/" className="mt-4 inline-flex rounded-full bg-stone-900 px-4 py-2 text-white dark:bg-stone-100 dark:text-stone-900">{t("Retour au catalogue", "العودة إلى الكتالوج")}</Link>
      </div>
    );
  }

  if (!productMeta) {
    return <div className="p-8 text-stone-900 dark:bg-stone-950 dark:text-stone-100">Chargement des details du produit...</div>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fef7ed_0%,_#fffaf0_40%,_#f5f5f4_100%)] px-4 pb-24 pt-16 dark:bg-[linear-gradient(135deg,_#0f172a_0%,_#111827_42%,_#1f2937_100%)] sm:px-6 lg:pb-10 lg:pt-10">
      <div className="mx-auto grid max-w-7xl gap-5 sm:gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4 sm:space-y-6">
          <article className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <div className="aspect-[5/4] bg-stone-200 dark:bg-stone-800">
              {mediaItems[activeMediaIndex]?.image ? (
                <img src={mediaItems[activeMediaIndex].image ?? ""} alt={perfume.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-500 dark:text-stone-300">Pas d'image</div>
              )}
            </div>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                {productMeta.isBestSeller && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900">{t("Meilleure vente", "الأكثر مبيعاً")}</span>}
                {productMeta.isTrending && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">{t("Tendance", "الأكثر رواجاً")}</span>}
              </div>

              <Link to="/" className="text-sm text-amber-700 hover:underline dark:text-amber-300">{t("Retour au catalogue", "العودة إلى الكتالوج")}</Link>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl">{perfume.name}</h1>
              <p className="inline-flex w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-800">
                {masterQualityLabel(t)}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300">{masterQualityDisclaimer(t)}</p>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300 lg:hidden"
              >
                {t("Aller au formulaire de commande", "الانتقال إلى نموذج الطلب")}
              </button>

              <div className="grid gap-3 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200 sm:grid-cols-2">
                <p><span className="font-semibold">{t("Marque:", "العلامة التجارية:")}</span> {localizePerfumeText(productMeta.brand, isArabic)}</p>
                <p><span className="font-semibold">{t("Genre:", "الجنس:")}</span> {localizePerfumeText(productMeta.gender, isArabic)}</p>
                <p><span className="font-semibold">{t("Prix:", "السعر:")}</span> <Currency amount={perfume.price} /></p>
                <p><span className="font-semibold">{t("Stock:", "المخزون:")}</span> {localizePerfumeText(productMeta.stockStatus, isArabic)}</p>
                <p><span className="font-semibold">{t("Famille olfactive:", "العائلة العطرية:")}</span> {localizePerfumeText(productMeta.fragranceFamily, isArabic)}</p>
                <p><span className="font-semibold">{t("Tailles disponibles:", "خيارات الحجم:")}</span> {productMeta.sizes.join(", ")}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
                {mediaItems.map((media, index) => (
                  <button
                    key={media.label}
                    type="button"
                    onClick={() => setActiveMediaIndex(index)}
                    className={`overflow-hidden rounded-xl border text-left ${activeMediaIndex === index ? "border-stone-900 dark:border-stone-200" : "border-stone-200 dark:border-stone-700"}`}
                  >
                    <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${media.tone}`}>
                      {media.image ? (
                        <img src={media.image} alt={media.label} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-stone-700">{media.label}</span>
                      )}
                    </div>
                    <p className="px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-200">{media.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-7">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 sm:text-2xl">{t("Details du parfum", "تفاصيل العطر")}</h2>
            <div className="mt-4 grid gap-3 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200 sm:grid-cols-2">
              <p><span className="font-semibold">{t("Notes de tete:", "المقدمة:")}</span> {perfume.top_notes.map((note) => localizePerfumeNote(note, isArabic)).join(" • ")}</p>
              <p><span className="font-semibold">{t("Notes de coeur:", "قلب العطر:")}</span> {perfume.heart_notes.map((note) => localizePerfumeNote(note, isArabic)).join(" • ")}</p>
              <p><span className="font-semibold">{t("Notes de fond:", "القاعدة:")}</span> {perfume.base_notes.map((note) => localizePerfumeNote(note, isArabic)).join(" • ")}</p>
              <p><span className="font-semibold">{t("Tenue:", "الثبات:")}</span> {localizePerfumeText(productMeta.longevity, isArabic)}</p>
              <p><span className="font-semibold">{t("Projete:", "الفوحان:")}</span> {localizePerfumeText(productMeta.sillage, isArabic)}</p>
              <p><span className="font-semibold">{t("Origine:", "بلد المنشأ:")}</span> {localizePerfumeText(perfume.country_of_origin, isArabic)}</p>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">{t("Pyramide olfactive", "الهرم العطري")}</p>
              <PerfumePyramid perfume={perfume} />
            </div>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-7">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 sm:text-2xl">{t("Description", "الوصف")}</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">{localizePerfumeText(perfume.description, isArabic)}</p>
            <div className="mt-4 grid gap-3 rounded-2xl bg-amber-50/70 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <p><span className="font-semibold">{t("Style:", "الطابع:")}</span> {localizePerfumeText(productMeta.vibe, isArabic)}</p>
              <p><span className="font-semibold">{t("Quand le porter:", "وقت الاستخدام:")}</span> {localizePerfumeText(productMeta.whenToWear, isArabic)}</p>
              <p><span className="font-semibold">{t("Sensation:", "الإحساس:")}</span> {localizePerfumeText(productMeta.feeling, isArabic)}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-7">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 sm:text-2xl">{t("Avis et notes", "التقييمات والمراجعات")}</h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{t(`Note ${productMeta.rating.toFixed(1)}/5 sur ${productMeta.reviewCount} avis`, `التقييم ${productMeta.rating.toFixed(1)} من 5 من ${productMeta.reviewCount} مراجعة`)}</p>

            <div className="mt-4 space-y-3">
              {productMeta.reviews.map((review) => (
                <article key={`${review.author}-${review.date}`} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{review.author}</p>
                    <p className="text-sm text-amber-700">{review.rating}/5</p>
                  </div>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{review.comment}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone-500">{review.date}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-7">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 sm:text-2xl">{t("Informations utiles", "معلومات إضافية مفيدة")}</h2>
            <div className="mt-4 space-y-3 text-sm text-stone-700 dark:text-stone-200">
              <p><span className="font-semibold">{t("Ingredients:", "المكونات:")}</span> {productMeta.ingredients.map((item) => localizePerfumeNote(item, isArabic)).join(", ")}</p>
              <p><span className="font-semibold">{t("Livraison:", "التوصيل:")}</span> {localizePerfumeText(productMeta.shipping, isArabic)}</p>
              <p><span className="font-semibold">{t("Politique de retour:", "سياسة الإرجاع:")}</span> {localizePerfumeText(productMeta.returns, isArabic)}</p>
              <p><span className="font-semibold">{t("Avis qualite:", "تنبيه الجودة:")}</span> {masterQualityDisclaimer(t)}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-7">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 sm:text-2xl">{t("Produits similaires", "منتجات مشابهة")}</h2>
            {relatedPerfumes.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">{t("Davantage de fragrances similaires bientot disponibles.", "ستتوفر عطور مشابهة قريباً.")}</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPerfumes.map((item) => (
                  <Link key={item.id} to={`/perfume/${item.slug}`} className="rounded-2xl border border-stone-200 p-3 transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-700">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                      {resolvePerfumeImage(item) ? (
                        <img src={resolvePerfumeImage(item) ?? ""} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-stone-500">Pas d'image</div>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.name}</p>
                    <p className="text-xs text-stone-600 dark:text-stone-300">{t("Profil olfactif similaire", "طابع عطري مشابه")}</p>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </section>

        <aside className="space-y-4 sm:space-y-6 lg:sticky lg:top-8 lg:h-fit">
          <section ref={purchaseSectionRef} id="purchase-section" className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-300">{t("Achat", "الشراء")}</p>
            <h2 className="mt-3 text-xl font-semibold text-stone-900 dark:text-stone-100 sm:text-2xl">{t("Commander ce parfum", "اشترِ هذا العطر")}</h2>

            <div className="mt-4 grid gap-2">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{t("Choisir une option", "اختر العرض")}</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(purchaseOptionLabels) as PurchaseOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, purchase_option: option }))}
                    className={`rounded-full px-3 py-2 text-sm font-medium sm:px-4 ${form.purchase_option === option ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border border-stone-300 text-stone-700 dark:border-stone-600 dark:text-stone-200"}`}
                  >
                    {t(purchaseOptionLabels[option].fr, purchaseOptionLabels[option].ar)}
                  </button>
                ))}
              </div>
            </div>

            <Legend />

            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {t("Prix unitaire:", "سعر الوحدة:")} <span className="font-semibold"><Currency amount={unitPrice} /></span>
            </div>

            <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {t("Total:", "المجموع:")} <span className="font-semibold"><Currency amount={total} /></span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-xl border border-stone-900 p-3 text-sm font-medium text-stone-900 hover:bg-stone-100 dark:border-stone-300 dark:text-stone-100 dark:hover:bg-stone-800"
              >
                {t("Ajouter au panier", "أضف إلى السلة")}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="rounded-xl bg-stone-900 p-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                {t("Acheter maintenant", "اشترِ الآن")}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setWishlist((current) => !current)}
              className="mt-2 w-full rounded-xl border border-rose-300 p-3 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-950/30"
            >
              {wishlist ? t("Ajoute aux favoris", "تم الحفظ في المفضلة") : t("Ajouter aux favoris", "أضف إلى المفضلة")}
            </button>

            <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
              <input
                ref={nameInputRef}
                className="w-full rounded-xl border border-stone-300 p-3.5 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                placeholder={t("Votre nom", "اسمك")}
                value={form.customer_name}
                onChange={(event) => setForm((current) => ({ ...current, customer_name: event.target.value }))}
              />
              <textarea
                className="min-h-28 w-full rounded-xl border border-stone-300 p-3.5 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                placeholder={t("Votre adresse", "عنوانك")}
                value={form.customer_address}
                onChange={(event) => setForm((current) => ({ ...current, customer_address: event.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-stone-300 p-3.5 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                placeholder={t("Numero de telephone", "رقم الهاتف")}
                value={form.customer_phone}
                onChange={(event) => setForm((current) => ({ ...current, customer_phone: event.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-stone-300 p-3.5 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-emerald-700 p-3 font-medium text-white disabled:opacity-70"
              >
                {submitting ? t("Validation de la commande...", "جارٍ تنفيذ الطلب...") : t("Confirmer la commande", "تأكيد الطلب")}
              </button>
            </form>

            {message && <p className="mt-3 text-sm text-stone-700 dark:text-stone-300">{message}</p>}
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">{t("Resume du produit", "ملخص المنتج")}</p>
            <div className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-200">
              <p><span className="font-semibold">{t("Recette:", "التركيبة:")}</span> {localizePerfumeText(perfume.recipe, isArabic)}</p>
              <p><span className="font-semibold">{t("Tenue:", "الثبات:")}</span> {localizePerfumeText(productMeta.longevity, isArabic)}</p>
              <p><span className="font-semibold">{t("Projete:", "الفوحان:")}</span> {localizePerfumeText(productMeta.sillage, isArabic)}</p>
              <p><span className="font-semibold">{t("Note:", "التقييم:")}</span> {productMeta.rating.toFixed(1)} / 5</p>
            </div>
          </section>
        </aside>
      </div>

      {!isPurchaseSectionVisible && (
        <button
          type="button"
          onClick={handleBuyNow}
          className="fixed bottom-4 left-4 right-4 z-40 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 lg:hidden"
        >
          {t("Commander ce parfum", "اطلب هذا العطر")}
        </button>
      )}
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (form: AdminLoginForm) => Promise<void> }) {
  const [form, setForm] = useState<AdminLoginForm>({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await onLogin(form);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const firstError = error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat()[0]
          : undefined;

        setMessage(typeof firstError === "string" ? firstError : error.response?.data?.message || "Echec de connexion.");
      } else {
        setMessage("Echec de connexion.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 px-6 py-10 dark:bg-stone-950">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl dark:bg-stone-900">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-300">Acces Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">Connexion Admin</h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">La connexion est reservee aux administrateurs.</p>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <input
            className="w-full rounded-xl border border-stone-300 p-3 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-stone-300 p-3 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Mot de passe"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <button className="w-full rounded-xl bg-stone-900 p-3 font-medium text-white disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900" disabled={submitting}>
            {submitting ? "Connexion..." : "Connexion"}
          </button>

          {message && <p className="text-sm text-rose-700">{message}</p>}
        </form>

        <p className="mt-4 text-sm text-stone-500 dark:text-stone-300">Admin: admin@example.com / Admin123456</p>
        <Link to="/" className="mt-4 inline-flex text-sm text-amber-700 hover:underline dark:text-amber-300">Retour au catalogue</Link>
      </div>
    </div>
  );
}

function Legend() {
  const { t } = useLanguage();

  return (
    <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
      <p className="font-semibold">{t("Legende:", "الوسيلة:" )}</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5">
        <li>{t("50ml: Bouteille individuelle de 50ml", "50 مل: زجاجة فردية 50 مل")}</li>
        <li>{t("Pack 30ml x4: 4 bouteilles de 30ml", "باك 30 مل × 4: 4 زجاجات 30 مل")}</li>
        <li>{t("Pack 50ml x3: 3 bouteilles de 50ml", "باك 50 مل × 3: 3 زجاجات 50 مل")}</li>
      </ul>
    </div>
  );
}

function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => Promise<void> }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await api.get<AdminOrder[]>("/admin/orders");
      setOrders(response.data);
    } catch {
      setMessage("Echec de chargement des commandes.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchOrders(true);

    const interval = window.setInterval(() => {
      void fetchOrders(false);
    }, 8000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const pendingOrders = orders.filter((order) => order.status !== "validated");
  const validatedOrders = orders.filter((order) => order.status === "validated");
  const totalRevenue = validatedOrders.reduce((sum, order) => sum + order.total_price, 0);
  const averageOrderValue = orders.length === 0 ? 0 : orders.reduce((sum, order) => sum + order.total_price, 0) / orders.length;
  const validationRate = orders.length === 0 ? 0 : (validatedOrders.length / orders.length) * 100;
  const today = new Date().toDateString();
  const ordersToday = orders.filter((order) => order.created_at && new Date(order.created_at).toDateString() === today).length;
  const latestOrders = orders.slice(0, 5);

  const formatOrderDate = (createdAt?: string | null) => {
    if (!createdAt) {
      return "-";
    }

    return new Date(createdAt).toLocaleString();
  };

  const markAsValidated = async (orderId: number) => {
    setUpdatingOrderId(orderId);
    setMessage("");

    try {
      const response = await api.patch<{ message: string; order: AdminOrder }>(`/admin/orders/${orderId}/validate`);
      setOrders((current) => current.map((order) => (order.id === orderId ? response.data.order : order)));
      setMessage(response.data.message);
    } catch {
      setMessage("Echec de validation de la commande.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(140deg,_#e7ecef_0%,_#f8f7f4_38%,_#fef7ed_100%)] px-4 py-8 dark:bg-[linear-gradient(140deg,_#020617_0%,_#111827_42%,_#1f2937_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-stone-200 bg-white/95 p-6 shadow-xl dark:border-stone-700 dark:bg-stone-900/95 lg:sticky lg:top-6">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500 dark:text-stone-300">Perfume House</p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">Console Admin</h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{user.name}</p>

          <nav className="mt-8 space-y-2">
            <a href="#stats" className="block rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 dark:bg-stone-800 dark:text-stone-100">Apercu</a>
            <a href="#pending-orders" className="block rounded-xl px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">Commandes en attente</a>
            <a href="#validated-orders" className="block rounded-xl px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">Commandes validees</a>
            <a href="#recent-activity" className="block rounded-xl px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">Activite recente</a>
          </nav>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => void fetchOrders(true)}
              className="w-full rounded-xl border border-amber-700 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 dark:border-amber-300 dark:text-amber-200 dark:hover:bg-amber-950/40"
            >
              Actualiser
            </button>
            <Link to="/" className="block w-full rounded-xl border border-stone-900 px-4 py-2 text-center text-sm font-medium text-stone-900 hover:bg-stone-900 hover:text-white dark:border-stone-300 dark:text-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-900">
              Ouvrir le catalogue
            </Link>
            <button
              onClick={() => void onLogout()}
              className="w-full rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              Deconnexion
            </button>
          </div>
        </aside>

        <main className="space-y-6">
          <section className="rounded-3xl border border-stone-200 bg-white p-7 shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-300">Tableau de bord</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">Commandes et Traitement</h2>
            <p className="mt-3 max-w-3xl text-sm text-stone-600 dark:text-stone-300">
              Validez rapidement les commandes des invites, suivez les statistiques de performance et l'activite.
            </p>
            {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p>}
          </section>

          <section id="stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">Total commandes</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">{orders.length}</p>
            </article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-800">En attente</p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">{pendingOrders.length}</p>
            </article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">Validees</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-900">{validatedOrders.length}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">Revenus valides</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100"><Currency amount={totalRevenue} /></p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">Valeur moyenne</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100"><Currency amount={averageOrderValue} /></p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">Aujourd hui / Taux</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">{ordersToday}</p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{validationRate.toFixed(1)}% validees</p>
            </article>
          </section>

          <section id="pending-orders" className="rounded-3xl border border-stone-200 bg-white p-7 shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-stone-900">Commandes en attente</h2>
              <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                {pendingOrders.length} en attente
              </p>
            </div>

            {loading ? (
              <p className="text-stone-600 dark:text-stone-300">Chargement des commandes...</p>
            ) : pendingOrders.length === 0 ? (
              <p className="text-stone-600 dark:text-stone-300">Aucune commande en attente.</p>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-stone-500 dark:text-stone-300">Commande #{order.id} • {formatOrderDate(order.created_at)}</p>
                        <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">{order.perfume ?? "Parfum"}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-300">{order.customer_name} • Qte {order.quantity} • {order.purchase_option}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800"
                        >
                          {expandedOrderId === order.id ? "Masquer" : "Details"}
                        </button>
                        <button
                          onClick={() => void markAsValidated(order.id)}
                          disabled={updatingOrderId === order.id}
                          className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-70"
                        >
                          {updatingOrderId === order.id ? "Validation..." : "Valider"}
                        </button>
                      </div>
                    </div>

                    {expandedOrderId === order.id && (
                      <div className="mt-4 grid gap-2 rounded-xl bg-stone-50 p-4 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                        <p><span className="font-semibold">Nom:</span> {order.customer_name}</p>
                        <p><span className="font-semibold">Adresse:</span> {order.customer_address}</p>
                        <p><span className="font-semibold">Telephone:</span> {order.customer_phone ?? "-"}</p>
                        <p><span className="font-semibold">Offre:</span> {order.purchase_option}</p>
                        <p><span className="font-semibold">Total:</span> <Currency amount={order.total_price} /></p>
                        <p><span className="font-semibold">Cree le:</span> {formatOrderDate(order.created_at)}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="validated-orders" className="rounded-3xl border border-stone-200 bg-white p-7 shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-stone-900">Commandes validees</h2>
              <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                {validatedOrders.length} completees
              </p>
            </div>

            {loading ? (
              <p className="text-stone-600 dark:text-stone-300">Chargement des commandes...</p>
            ) : validatedOrders.length === 0 ? (
              <p className="text-stone-600 dark:text-stone-300">Aucune commande validee.</p>
            ) : (
              <div className="space-y-3">
                {validatedOrders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-emerald-800">Commande #{order.id} • {formatOrderDate(order.created_at)}</p>
                        <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">{order.perfume ?? "Parfum"}</p>
                        <p className="text-sm text-stone-700 dark:text-stone-200">{order.customer_name} • Qte {order.quantity} • {order.purchase_option}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-800">Validee</p>
                        <p className="text-sm text-stone-700 dark:text-stone-200"><Currency amount={order.total_price} /></p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="recent-activity" className="rounded-3xl border border-stone-200 bg-white p-7 shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Activite recente</h2>
            {latestOrders.length === 0 ? (
              <p className="mt-3 text-stone-600 dark:text-stone-300">Aucune activite.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {latestOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-200">
                    <p>
                      <span className="font-semibold">Commande #{order.id}</span> par {order.customer_name} ({order.status})
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-stone-500">{formatOrderDate(order.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = window.localStorage.getItem(languageStorageKey);
    if (savedLanguage === "ar" || savedLanguage === "fr") {
      return savedLanguage;
    }

    return window.navigator.language.startsWith("ar") ? "ar" : "fr";
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hideEmptyCartPrompt, setHideEmptyCartPrompt] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem(tokenStorageKey);

    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    void api.get<User>("/user")
      .then((response) => setUser(response.data))
      .catch(() => {
        window.localStorage.removeItem(tokenStorageKey);
        delete api.defaults.headers.common.Authorization;
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (form: AdminLoginForm) => {
    const response = await api.post<{ access_token: string; user: User }>("/login", form);
    window.localStorage.setItem(tokenStorageKey, response.data.access_token);
    api.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
    setUser(response.data.user);
    navigate("/admin", { replace: true });
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } finally {
      window.localStorage.removeItem(tokenStorageKey);
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  const handleAddToCart = (item: CartItem) => {
    setHideEmptyCartPrompt(false);
    setIsCartOpen(true);
    setCartItems((current) => {
      const existingIndex = current.findIndex((entry) => entry.key === item.key);
      if (existingIndex === -1) {
        return [...current, item];
      }

      return current.map((entry, index) => (index === existingIndex
        ? { ...entry, quantity: entry.quantity + item.quantity }
        : entry));
    });
  };

  if (loading) {
    return <div className="p-8 dark:bg-stone-950 dark:text-stone-100">Chargement de la session...</div>;
  }

  const isArabic = language === "ar";
  const t = (english: string, arabic: string) => (isArabic ? arabic : english);
  const languageLabelFr = "FR";
  const languageLabelAr = "AR";
  const isStorefrontRoute = location.pathname === "/"
    || location.pathname === "/parfumes"
    || location.pathname === "/offres"
    || location.pathname === "/marques"
    || location.pathname === "/packs"
    || location.pathname === "/saisons";
  const controlsTopClass = isStorefrontRoute ? "top-16" : "top-3";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isArabic, t }}>
      {!isStorefrontRoute && (
        <div className={`fixed left-3 z-50 flex items-center gap-0.5 rounded-full border border-stone-300 bg-white/95 p-0.5 text-[10px] font-semibold text-stone-800 shadow-lg backdrop-blur transition-all ${controlsTopClass}`}>
          <button
            type="button"
            onClick={() => setLanguage("fr")}
            className={`rounded-full px-2 py-0.5 transition ${language === "fr" ? "bg-stone-900 text-white" : "text-stone-700"}`}
            aria-pressed={language === "fr"}
          >
            {languageLabelFr}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ar")}
            className={`rounded-full px-2 py-0.5 transition ${language === "ar" ? "bg-stone-900 text-white" : "text-stone-700"}`}
            aria-pressed={language === "ar"}
          >
            {languageLabelAr}
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<StorefrontPage
            mode="home"
            cartItems={cartItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            hideEmptyCartPrompt={hideEmptyCartPrompt}
            setHideEmptyCartPrompt={setHideEmptyCartPrompt}
          />}
        />
        <Route
          path="/parfumes"
          element={<StorefrontPage
            mode="parfumes"
            cartItems={cartItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            hideEmptyCartPrompt={hideEmptyCartPrompt}
            setHideEmptyCartPrompt={setHideEmptyCartPrompt}
          />}
        />
        <Route
          path="/offres"
          element={<StorefrontPage
            mode="offres"
            cartItems={cartItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            hideEmptyCartPrompt={hideEmptyCartPrompt}
            setHideEmptyCartPrompt={setHideEmptyCartPrompt}
          />}
        />
        <Route
          path="/marques"
          element={<StorefrontPage
            mode="marques"
            cartItems={cartItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            hideEmptyCartPrompt={hideEmptyCartPrompt}
            setHideEmptyCartPrompt={setHideEmptyCartPrompt}
          />}
        />
        <Route
          path="/packs"
          element={<StorefrontPage
            mode="packs"
            cartItems={cartItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            hideEmptyCartPrompt={hideEmptyCartPrompt}
            setHideEmptyCartPrompt={setHideEmptyCartPrompt}
          />}
        />
        <Route path="/pack/:packId" element={<PackOrderPage onAddToCart={handleAddToCart} />} />
        <Route path="/perfume/:slug" element={<PerfumeOrderPage onAddToCart={handleAddToCart} />} />
        <Route path="/admin/login" element={user ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={handleLogin} />} />
        <Route path="/admin" element={user ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageContext.Provider>
  );
}

export default App;
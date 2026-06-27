import { HistoryItem, DiagnosisResult } from "./types";

export const defaultDiagnosisOil: DiagnosisResult = {
  stainName: "Oil-based stain",
  confidence: 92,
  fabricType: "Cotton Fabric",
  absorbency: "Medium Absorbency",
  precaution: "Crucial Precaution: Do not use hot water before removing the oil. Heat will set the grease permanently into the cotton fibers.",
  steps: [
    {
      title: "Blot the stain immediately",
      description: "Use a clean paper towel to lift excess oil. Do not rub.",
    },
    {
      title: "Apply dish soap",
      description: "Gently massage a grease-cutting detergent (like Blue Dawn) into the area.",
    },
    {
      title: "Wash with warm water",
      description: "Rinse thoroughly under lukewarm running water.",
    },
    {
      title: "Air dry and inspect",
      description: "Confirm the stain is gone before placing in a dryer. Tumble dryers lock oil in.",
    }
  ],
  communityWisdom: [
    {
      source: "r/Laundry Advice",
      text: "Talcum powder or cornstarch works for fresh grease. Let it absorb the oil for 30 mins.",
      subtext: "142 users found this helpful"
    },
    {
      source: "Fabric Expert",
      text: "For high-quality cotton, try white vinegar to restore fabric softness after soap treatment.",
      subtext: "Professional recommendation"
    }
  ]
};

export const defaultDiagnosisCoffee: DiagnosisResult = {
  stainName: "Coffee stain",
  confidence: 94,
  fabricType: "Cotton Fabric",
  absorbency: "High Absorbency",
  precaution: "Crucial Precaution: Do not apply direct heat or iron the garment before the coffee is fully removed. Heat will bake the organic tannins into the fibers, turning it permanent.",
  steps: [
    {
      title: "Blot, don't rub",
      description: "Use a clean white paper towel to press and absorb any remaining liquid. Rubbing will spread the tannin pigments deeper.",
    },
    {
      title: "Flush with cold water",
      description: "Run cold water through the back of the stain for 5 minutes to flush out as much coffee concentrate as possible.",
    },
    {
      title: "Apply liquid detergent",
      description: "Gently dab a small amount of liquid laundry detergent or dish soap onto the stain. Let it sit for 5-10 minutes.",
    },
    {
      title: "Soak in lukewarm water",
      description: "Submerge the garment in lukewarm water with a spoonful of oxygen bleach or white vinegar for 30 minutes, then rinse and air dry.",
    }
  ],
  communityWisdom: [
    {
      source: "r/Laundry Advice",
      text: "White vinegar mixed with a bit of dish soap works amazingly well to release dried coffee stains.",
      subtext: "284 users found this helpful"
    },
    {
      source: "Fabric Expert",
      text: "For delicate fabrics like silk, stick to pure cold water flushing and professional cleaning.",
      subtext: "Professional recommendation"
    }
  ]
};

export const defaultDiagnosisWine: DiagnosisResult = {
  stainName: "Red wine stain",
  confidence: 89,
  fabricType: "Cotton Fabric",
  absorbency: "High Absorbency",
  precaution: "Crucial Precaution: Never use hand soap or dish soap with high pH on red wine. The alkalinity can react with the wine pigments and dye the fabric blue or purple.",
  steps: [
    {
      title: "Blot immediately",
      description: "Absorb as much wet wine as possible using a clean cloth. Apply light pressure.",
    },
    {
      title: "Apply salt or baking soda",
      description: "Generously cover the wet stain with table salt or baking soda. Let it sit for 15 minutes to draw out the wine via capillary action.",
    },
    {
      title: "Taut-flush with boiling or hot water",
      description: "Stretch the stained fabric over a bowl, secure with a rubber band, and pour boiling water from a height of 2 feet (only for cotton/polyester).",
    },
    {
      title: "Wash with enzyme detergent",
      description: "Machine wash on a normal cycle with an oxygen-based color-safe booster.",
    }
  ],
  communityWisdom: [
    {
      source: "r/Laundry Advice",
      text: "If the stain has dried, club soda or hydrogen peroxide mixed with dish soap lifts red wine instantly.",
      subtext: "412 users found this helpful"
    },
    {
      source: "Fabric Expert",
      text: "Salt is a savior, but brush it off fully before washing so it doesn't cause abrasive wear.",
      subtext: "Verified safety guide"
    }
  ]
};

export const defaultDiagnosisInk: DiagnosisResult = {
  stainName: "Ink-based stain",
  confidence: 91,
  fabricType: "Denim Fabric",
  absorbency: "Medium Absorbency",
  precaution: "Crucial Precaution: Standard water washing will make ink bleed and ruin other sections of the garment. Always isolate the stain with a backing towel.",
  steps: [
    {
      title: "Isolate with backing towel",
      description: "Place a folded clean white cloth or paper towel directly underneath the ink stain to catch bleeding ink.",
    },
    {
      title: "Apply rubbing alcohol (Isopropyl)",
      description: "Saturate a cotton swab in rubbing alcohol or hand sanitizer and dab directly onto the ink. Watch the ink transfer to the backing towel.",
    },
    {
      title: "Blot continuously",
      description: "Use a dry paper towel to press and lift the dissolved ink. Move to clean sections of the towel frequently.",
    },
    {
      title: "Pre-treat and wash",
      description: "Apply a drop of liquid detergent, rub gently, and rinse with cold water before a normal wash.",
    }
  ],
  communityWisdom: [
    {
      source: "r/Laundry Advice",
      text: "Aerosol hairspray (the cheap, alcohol-rich kind) is a legendary quick trick to dissolve ballpoint ink.",
      subtext: "198 users found this helpful"
    },
    {
      source: "Fabric Expert",
      text: "Avoid rubbing alcohol on acetate or triacetate fabrics as it will dissolve the fibers themselves!",
      subtext: "Professional warning"
    }
  ]
};

export const initialHistory: HistoryItem[] = [
  {
    id: "hist-1",
    stainName: "Coffee stain on shirt",
    date: "May 12",
    fabricType: "Cotton",
    garmentType: "Shirt",
    status: "Success",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNPs4lfVRNaz11hpWzpihFard226XVPuk68G-xsEgyPSPkyaoQfunPbTTt2DOqrE1cR3tgCzWk760udwhEVN3vCJWM-ErBaousL0K09Kh9Yn8k7ZIBQDYAD0ibBsrp-eEhZPcGD8wURT5k1XQebcFXJKDZf551UZ7YbMQJpBxk96ZliMQe0BKWGdPfLvdaRJ7k6AihjCXnlzLMsfu7pK5CIzP5pVhcQkv3ocTw97AxDoGiAIxiKyYIiA",
    diagnosis: defaultDiagnosisCoffee
  },
  {
    id: "hist-2",
    stainName: "Ink stain on jeans",
    date: "May 10",
    fabricType: "Denim",
    garmentType: "Jeans",
    status: "Pending",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX1HtwILbULqgmrFLasmVRUfCfJShW-mplQq9dNHSCgJyh8SUnxmQGJuyC8K6LRNwFD-CT-vQsTu_gLK2fvgP5q8wWNX-OEB8mg3mldiWQw2wqiA4eOb8LTNR_jgX_hiQkXMzkFoL4nkB6Yc7YMHZwogZ7CbwwGOEyiBo_vgn0LuY1DXt51TAiwsZGf73z1MDhUQzlk3dqNQolky1RphDt5ChTP0nO0R-3M_xibxI05dSiavl1lEQbJA",
    diagnosis: defaultDiagnosisInk
  },
  {
    id: "hist-3",
    stainName: "Oil stain on jacket",
    date: "May 5",
    fabricType: "Polyester",
    garmentType: "Outerwear",
    status: "Success",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjxLHkZollz60UMuNI0ZAb9lHEjZXeiXs74PSvZnrGBtZI100Q4KPw6nkmwaR39_9dJw9UOAf_4fBca_FqtgReJL5mcQSVrJjBnTgp7pBFlwSmR7f1AJK_4TuVLkkQ9WhP1yxoyEKXcnEYgWxAmIikQDt28TuJFwRC_GuF8z1_Momd1gSsvggO0e5KptP1dYBsXDrCVQacXkhjKjGq-XsCOa63N8A41Pet044xK0m-6RBQKHZh34-qPw",
    diagnosis: defaultDiagnosisOil
  }
];

export const quickGuides = [
  {
    id: "guide-oil",
    stain: "Oil",
    description: "Degrease fast",
    iconName: "oil_barrel",
    diagnosis: defaultDiagnosisOil
  },
  {
    id: "guide-coffee",
    stain: "Coffee",
    description: "Blot, don't rub",
    iconName: "coffee",
    diagnosis: defaultDiagnosisCoffee
  },
  {
    id: "guide-wine",
    stain: "Wine",
    description: "Salt is key",
    iconName: "liquor",
    diagnosis: defaultDiagnosisWine
  },
  {
    id: "guide-ink",
    stain: "Ink",
    description: "Alcohol rinse",
    iconName: "ink_highlighter",
    diagnosis: defaultDiagnosisInk
  }
];

import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";

type Condition = {
  name: string;
  slug: string;
  metaTitle: string;
  metaDesc: string;
  headline: string;
  subline: string;
  intro: string;
  symptoms: string[];
  howHelps: string[];
  faqs: { q: string; a: string }[];
  schema: object;
};

export const CONDITIONS: Record<string, Condition> = {
  "skin-problems": {
    name: "Skin Problems",
    slug: "skin-problems",
    metaTitle: "Homeopathic Treatment for Skin Problems — NeoHomeo",
    metaDesc: "Treat eczema, acne, psoriasis, and chronic skin irritation with personalised homeopathy. Consult a verified homeopathic doctor online on NeoHomeo.",
    headline: "Homeopathic Treatment for Skin Problems",
    subline: "Eczema, acne, psoriasis & chronic irritation — treated from the root cause.",
    intro: "Skin conditions are rarely just skin-deep. Homeopathy addresses the underlying triggers — immune response, stress, diet, and constitutional tendencies — rather than suppressing symptoms. Our doctors build an individual profile of your skin, lifestyle, and emotional patterns to select a remedy that works with your body.",
    symptoms: ["Recurring eczema or dermatitis", "Acne that worsens with stress or hormones", "Psoriasis flare-ups", "Chronic itching or hives", "Dry, scaly, or inflamed skin patches"],
    howHelps: ["Identifies constitutional triggers (food, stress, environment)", "Selects individualised remedies — not a one-size-fits-all protocol", "Reduces reliance on steroid creams over time", "Tracks seasonal and lifestyle patterns through follow-ups"],
    faqs: [
      { q: "Can homeopathy cure eczema permanently?", a: "Homeopathy aims to reduce frequency and severity of flare-ups by addressing root causes. Many patients experience long-term remission with consistent treatment." },
      { q: "How long does homeopathic skin treatment take?", a: "Chronic skin conditions typically need 3–6 months of treatment. Your doctor sets milestones at each follow-up." },
      { q: "Is homeopathy safe for children with skin problems?", a: "Yes. Homeopathic remedies are safe for all ages and particularly gentle for children." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Skin Conditions",
      "alternateName": ["Eczema", "Acne", "Psoriasis", "Dermatitis"],
      "description": "Skin conditions including eczema, acne, and psoriasis treated with individualised homeopathic remedies.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "hair-fall": {
    name: "Hair Fall",
    slug: "hair-fall",
    metaTitle: "Homeopathic Treatment for Hair Fall — NeoHomeo",
    metaDesc: "Stop hair fall and promote regrowth with personalised homeopathy. Address root causes like stress, hormones, and nutritional deficiency online on NeoHomeo.",
    headline: "Homeopathic Treatment for Hair Fall",
    subline: "Diffuse shedding, post-illness hair loss & scalp health — addressed at the root.",
    intro: "Hair fall is a signal from the body — stress, hormonal shifts, post-viral recovery, or nutritional depletion. Homeopathy doesn't just target the scalp; it reads the whole picture. Our doctors explore your timeline of hair loss, stress levels, diet, and any recent illness to build a remedy plan that supports regrowth from within.",
    symptoms: ["Diffuse or patchy shedding", "Hair loss after illness, surgery, or childbirth", "Thinning at temples or crown", "Scalp dryness, dandruff, or itching", "Premature greying"],
    howHelps: ["Maps hair loss to triggers (hormonal, stress, nutritional)", "Constitutional remedies support regrowth cycles", "Addresses scalp health alongside hair quality", "Regular follow-ups adjust treatment as your hair responds"],
    faqs: [
      { q: "Can homeopathy regrow lost hair?", a: "Homeopathy can stimulate regrowth in many cases, particularly when hair loss is linked to stress, hormones, or post-illness recovery. Results vary based on the cause and duration." },
      { q: "How long before I see results?", a: "Most patients notice reduced shedding within 6–8 weeks. Visible regrowth typically takes 3–6 months." },
      { q: "Does homeopathy work for alopecia areata?", a: "Yes, many practitioners report positive outcomes for alopecia areata with individualised homeopathic treatment." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Hair Loss",
      "alternateName": ["Alopecia", "Hair Fall", "Diffuse Hair Loss"],
      "description": "Hair fall and alopecia treated with constitutional homeopathic remedies addressing root causes.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "migraine": {
    name: "Migraine",
    slug: "migraine",
    metaTitle: "Homeopathic Treatment for Migraine — NeoHomeo",
    metaDesc: "Reduce migraine frequency and intensity with personalised homeopathy. Identify your triggers — stress, hormones, food — with a verified doctor on NeoHomeo.",
    headline: "Homeopathic Treatment for Migraine",
    subline: "Aura, triggers, hormonal patterns & recurring headaches — treated individually.",
    intro: "Migraines are deeply personal. Two people with the same diagnosis may have entirely different triggers, timings, and accompanying symptoms. Homeopathy excels here — it builds a complete profile of your headaches: when they start, what makes them worse, what brings relief, and how they connect to your emotional and hormonal cycles.",
    symptoms: ["Recurring unilateral or bilateral headaches", "Visual aura before or during attacks", "Nausea, vomiting, or light sensitivity", "Menstrual-cycle-linked migraines", "Headaches triggered by stress, food, or weather"],
    howHelps: ["Maps individual trigger patterns — food, stress, hormones, weather", "Reduces frequency and intensity over time", "Addresses associated symptoms (nausea, light sensitivity)", "Connects menstrual cycles to migraine patterns for women"],
    faqs: [
      { q: "Can homeopathy prevent migraines?", a: "Many patients experience a significant reduction in migraine frequency with constitutional homeopathic treatment over 3–6 months." },
      { q: "Is homeopathy effective for migraines with aura?", a: "Yes. The presence of aura, visual disturbances, and other symptoms are part of the individualised case-taking that guides remedy selection." },
      { q: "Can I take homeopathic remedies alongside my current medication?", a: "Homeopathic remedies are generally safe alongside conventional medication. Discuss your current treatment with your NeoHomeo doctor." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Migraine",
      "description": "Migraine headaches treated with individualised homeopathy addressing triggers, frequency, and associated symptoms.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "pcos": {
    name: "PCOS",
    slug: "pcos",
    metaTitle: "Homeopathic Treatment for PCOS — NeoHomeo",
    metaDesc: "Manage PCOS naturally with personalised homeopathy. Regulate cycles, reduce cysts, and address metabolic and mood symptoms with a verified doctor online.",
    headline: "Homeopathic Treatment for PCOS",
    subline: "Cycle regulation, metabolic signals & mood-linked symptoms — treated holistically.",
    intro: "PCOS affects far more than cycles. It touches metabolism, mood, skin, weight, and fertility. Homeopathy approaches PCOS as a constitutional condition — mapping your hormonal patterns, stress response, dietary habits, and symptom clusters to find a remedy that works with your body's own regulatory systems.",
    symptoms: ["Irregular or absent periods", "Ovarian cysts detected on ultrasound", "Unexplained weight gain", "Acne, facial hair, or hair thinning", "Mood swings, anxiety, or fatigue"],
    howHelps: ["Supports hormonal regulation naturally over time", "Addresses metabolic factors alongside cycle irregularity", "Reduces associated symptoms (acne, hair changes, mood)", "Complements dietary and lifestyle interventions"],
    faqs: [
      { q: "Can homeopathy cure PCOS?", a: "Homeopathy aims to reduce symptom severity and regulate cycles. It works best as part of a holistic approach alongside diet and lifestyle changes." },
      { q: "How long does PCOS treatment take?", a: "Most patients see improvement in cycle regularity within 3–4 months. Full constitutional treatment typically spans 6–12 months." },
      { q: "Can homeopathy help with PCOS-related infertility?", a: "Homeopathy supports hormonal balance which may improve fertility outcomes. Discuss your specific situation with your NeoHomeo doctor." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Polycystic Ovary Syndrome",
      "alternateName": ["PCOS", "PCOD"],
      "description": "PCOS managed with constitutional homeopathic treatment addressing hormonal, metabolic, and psychological aspects.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "thyroid": {
    name: "Thyroid Balance",
    slug: "thyroid",
    metaTitle: "Homeopathic Treatment for Thyroid — NeoHomeo",
    metaDesc: "Support thyroid health naturally with homeopathy. Address hypothyroid and hyperthyroid symptoms — fatigue, weight changes, mood swings — with a verified doctor.",
    headline: "Homeopathic Treatment for Thyroid Imbalance",
    subline: "Energy, weight, temperature sensitivity & mood — treated at the hormonal root.",
    intro: "Thyroid imbalances affect almost every system in the body. Whether hypothyroid (sluggish) or hyperthyroid (overactive), the symptoms reach into your energy, weight, mood, skin, and temperature regulation. Homeopathy supports thyroid function by addressing the constitutional patterns that underlie the imbalance.",
    symptoms: ["Unexplained fatigue or sluggishness", "Weight gain or difficulty losing weight", "Cold sensitivity, dry skin, hair loss (hypothyroid)", "Anxiety, palpitations, heat intolerance (hyperthyroid)", "Brain fog or poor concentration"],
    howHelps: ["Supports thyroid gland function naturally", "Maps symptoms to constitutional remedy type", "Works alongside thyroid medication as a complement", "Monitors progress through follow-up TSH patterns"],
    faqs: [
      { q: "Can homeopathy replace thyroid medication?", a: "Homeopathy is best used alongside conventional thyroid treatment, not as a replacement. It supports overall health while your doctor monitors TSH levels." },
      { q: "Does homeopathy work for both hypo and hyperthyroidism?", a: "Yes. The remedy selection differs but homeopathy addresses both conditions through individual constitutional assessment." },
      { q: "How soon will I feel better?", a: "Energy and mood improvements are often noticeable within 4–8 weeks, though deeper constitutional changes take longer." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Thyroid Disease",
      "alternateName": ["Hypothyroidism", "Hyperthyroidism", "Thyroid Imbalance"],
      "description": "Thyroid imbalances including hypothyroidism and hyperthyroidism supported with individualised homeopathic remedies.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "stress-anxiety": {
    name: "Stress & Anxiety",
    slug: "stress-anxiety",
    metaTitle: "Homeopathic Treatment for Stress & Anxiety — NeoHomeo",
    metaDesc: "Manage stress, anxiety, and sleep issues naturally with homeopathy. Get a personalised remedy plan from a verified homeopathic doctor online on NeoHomeo.",
    headline: "Homeopathic Treatment for Stress & Anxiety",
    subline: "Sleep, focus, nervous tension & how your body holds stress — treated gently.",
    intro: "Stress and anxiety manifest differently in every person. Some carry it in the gut, others in the chest or sleep. Homeopathy maps how your nervous system responds — the physical signs, mental patterns, and emotional triggers — to select a remedy that soothes your specific stress response rather than a generic one.",
    symptoms: ["Persistent worry or anticipatory anxiety", "Poor sleep or early waking", "Tension headaches or tight chest", "Digestive upset linked to stress", "Fatigue despite rest, or inability to switch off"],
    howHelps: ["Maps how stress manifests in your body specifically", "Supports nervous system regulation without sedation", "Addresses physical symptoms of anxiety (gut, chest, sleep)", "Safe for long-term use without dependency"],
    faqs: [
      { q: "Is homeopathy safe for anxiety without side effects?", a: "Yes. Homeopathic remedies are non-addictive and have no known side effects, making them suitable for long-term stress management." },
      { q: "Can homeopathy help with panic attacks?", a: "Many patients report reduced frequency and intensity of panic attacks with constitutional homeopathic treatment alongside lifestyle support." },
      { q: "Will homeopathy make me drowsy?", a: "No. Unlike sedating medications, homeopathic remedies work to regulate the nervous system without causing drowsiness." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Anxiety Disorder",
      "alternateName": ["Stress", "Anxiety", "Generalised Anxiety", "Panic"],
      "description": "Stress and anxiety managed with constitutional homeopathic remedies addressing nervous system response.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "allergies": {
    name: "Allergies",
    slug: "allergies",
    metaTitle: "Homeopathic Treatment for Allergies — NeoHomeo",
    metaDesc: "Treat seasonal allergies, food sensitivities, and respiratory issues naturally. Get a personalised homeopathic plan from a verified doctor online on NeoHomeo.",
    headline: "Homeopathic Treatment for Allergies",
    subline: "Seasonal flare-ups, food sensitivities & respiratory comfort — treated individually.",
    intro: "Allergies are the immune system over-responding to harmless triggers. Homeopathy works to recalibrate this response — not just suppress the sneezing or rash, but reduce the underlying hypersensitivity over time. Our doctors explore your full allergy history: what triggers you, when it started, what makes it better or worse.",
    symptoms: ["Seasonal rhinitis (sneezing, runny nose, itchy eyes)", "Food sensitivities causing gut or skin reactions", "Asthma or wheezing triggered by allergens", "Skin hives or urticaria after exposure", "Persistent cough or post-nasal drip"],
    howHelps: ["Reduces immune hypersensitivity to specific triggers", "Addresses seasonal patterns before they peak", "Complements allergy testing and dietary management", "Reduces dependence on antihistamines over time"],
    faqs: [
      { q: "Can homeopathy cure allergies permanently?", a: "Many patients achieve long-term desensitisation with consistent homeopathic treatment over 6–12 months, particularly for seasonal and respiratory allergies." },
      { q: "Is homeopathy effective for dust and pollen allergies?", a: "Yes. Environmental allergens like dust, pollen, and pet dander are commonly addressed with homeopathic isopathic and constitutional treatment." },
      { q: "Can children with allergies use homeopathy?", a: "Absolutely. Homeopathy is particularly well suited to children and is safe alongside conventional allergy management." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Allergic Disease",
      "alternateName": ["Allergies", "Allergic Rhinitis", "Food Allergy", "Urticaria"],
      "description": "Allergies including seasonal rhinitis, food sensitivities, and skin reactions treated with individualised homeopathic remedies.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "joint-pain": {
    name: "Joint Pain",
    slug: "joint-pain",
    metaTitle: "Homeopathic Treatment for Joint Pain & Arthritis — NeoHomeo",
    metaDesc: "Reduce joint pain, stiffness, and inflammation naturally with homeopathy. Consult a verified homeopathic doctor online for arthritis and musculoskeletal conditions.",
    headline: "Homeopathic Treatment for Joint Pain",
    subline: "Morning stiffness, inflammation & exertion limits — treated at the root.",
    intro: "Joint pain — whether from arthritis, gout, old injuries, or inflammatory conditions — often worsens slowly. Homeopathy addresses the inflammatory patterns and constitutional tendencies that sustain pain, rather than just masking it. Our doctors explore the character of your pain: when it's worst, what relieves it, and how it's changed over time.",
    symptoms: ["Morning stiffness that improves with movement", "Swollen, hot, or tender joints", "Pain worse in cold or damp weather", "Limited range of motion in knees, hips, or spine", "Recurring gout or uric acid elevation"],
    howHelps: ["Reduces inflammation without gastrointestinal side effects", "Addresses constitutional predisposition to joint disease", "Tracks weather and activity patterns in remedy selection", "Supports mobility and pain-free function over time"],
    faqs: [
      { q: "Can homeopathy help with rheumatoid arthritis?", a: "Homeopathy can help manage rheumatoid arthritis symptoms, reduce flare frequency, and improve quality of life alongside conventional treatment." },
      { q: "Is homeopathy effective for knee pain?", a: "Many patients with knee osteoarthritis and sports injuries report significant pain reduction and improved mobility with homeopathic treatment." },
      { q: "How long before joint pain improves?", a: "Most patients notice improvement within 4–8 weeks. Chronic conditions require longer treatment of 4–12 months." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Joint Pain",
      "alternateName": ["Arthritis", "Rheumatoid Arthritis", "Osteoarthritis", "Gout"],
      "description": "Joint pain and arthritis treated with constitutional homeopathic remedies addressing inflammation and structural patterns.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "digestive": {
    name: "Digestive Issues",
    slug: "digestive",
    metaTitle: "Homeopathic Treatment for Digestive Problems — NeoHomeo",
    metaDesc: "Treat IBS, acidity, bloating, and constipation naturally with homeopathy. Get a personalised digestive health plan from a verified doctor online on NeoHomeo.",
    headline: "Homeopathic Treatment for Digestive Issues",
    subline: "Bloating, acidity, IBS & appetite swings — treated individually.",
    intro: "The gut is the second brain — it responds to stress, diet, and emotional states in real time. Digestive issues are rarely just mechanical; they reflect deeper constitutional patterns. Homeopathy explores the full picture of your digestion: what triggers upset, timing patterns, food sensitivities, and the emotional context of your symptoms.",
    symptoms: ["Bloating, gas, or abdominal distension after meals", "Chronic acidity, GERD, or heartburn", "Irritable bowel syndrome (IBS) — diarrhoea or constipation", "Appetite fluctuations or food aversions", "Nausea linked to stress or travel"],
    howHelps: ["Maps food triggers and stress patterns to remedy selection", "Addresses IBS by treating the gut-brain axis holistically", "Reduces acid reflux without long-term antacid dependence", "Supports regular elimination and appetite regulation"],
    faqs: [
      { q: "Can homeopathy cure IBS?", a: "Homeopathy significantly reduces IBS symptoms in many patients, particularly those where stress and emotional patterns are linked to gut behaviour." },
      { q: "How long does digestive treatment take?", a: "Acute issues (acidity, nausea) often improve within 2–4 weeks. Chronic conditions like IBS typically need 3–6 months of constitutional treatment." },
      { q: "Is homeopathy safe for gut issues alongside other medication?", a: "Yes. Homeopathic remedies are safe alongside most conventional medications. Inform your NeoHomeo doctor of current treatments." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalCondition",
      "name": "Digestive Disorders",
      "alternateName": ["IBS", "Irritable Bowel Syndrome", "GERD", "Acid Reflux", "Bloating"],
      "description": "Digestive disorders including IBS, acidity, and bloating treated with individualised homeopathic remedies.",
      "possibleTreatment": { "@type": "MedicalTherapy", "name": "Homeopathic Treatment", "provider": { "@type": "MedicalOrganization", "name": "NeoHomeo", "url": "https://neohomeo.com" } },
    },
  },
  "children": {
    name: "Children's Care",
    slug: "children",
    metaTitle: "Homeopathic Treatment for Children — NeoHomeo",
    metaDesc: "Safe, gentle homeopathic care for children — allergies, recurring infections, sleep, and growth concerns. Consult a verified paediatric-friendly doctor online.",
    headline: "Homeopathic Care for Children",
    subline: "Gentle, age-aware treatment for growing bodies — with caregiver support.",
    intro: "Children respond exceptionally well to homeopathy. Their vital force is strong, and the remedies work quickly. Our doctors take a careful history from parents — noting temperament, sleep, feeding, recurring infections, and developmental patterns — to select a remedy that supports each child as an individual.",
    symptoms: ["Recurring ear, throat, or chest infections", "Allergic conditions — eczema, asthma, rhinitis", "Sleep difficulties or night terrors", "Behavioural changes, irritability, or anxiety", "Growth concerns or appetite issues"],
    howHelps: ["Reduces frequency of recurring infections over time", "Addresses temperament and behaviour alongside physical symptoms", "Safe with no chemical side effects for any age", "Supports the child's natural immune development"],
    faqs: [
      { q: "Is homeopathy safe for infants and toddlers?", a: "Yes. Homeopathic remedies are safe from birth. Dosing and potency are adjusted for the child's age and weight." },
      { q: "Can homeopathy help with my child's recurring tonsillitis?", a: "Many children with recurring throat infections respond very well to constitutional homeopathic treatment, reducing the frequency of infections." },
      { q: "Do I need to be present during the consultation?", a: "For children under 12, a parent or guardian attends the consultation and provides the case history. The child joins if old enough." },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MedicalSpecialty",
      "name": "Paediatric Homeopathy",
      "description": "Gentle homeopathic care for children addressing infections, allergies, sleep, and developmental concerns.",
      "relevantSpecialty": { "@type": "MedicalSpecialty", "name": "Pediatrics" },
    },
  },
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="glass-panel p-0 overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-semibold text-teal-950 text-sm">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-teal-500 flex-shrink-0">⌄</motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ overflow: "hidden" }}
      >
        <p className="px-5 pb-4 text-sm text-teal-900/70 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

import React, { useEffect } from "react";

export default function ConditionPage() {
  const { slug } = useParams<{ slug: string }>();
  const condition = CONDITIONS[slug ?? ""];

  useEffect(() => {
    if (!condition) return;
    document.title = condition.metaTitle;
    let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!el) { el = document.createElement("meta"); el.name = "description"; document.head.appendChild(el); }
    el.content = condition.metaDesc;
  }, [condition]);

  if (!condition) {
    return (
      <PageShell className="hero-gradient">
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-5xl">404</p>
          <p className="text-teal-900/70">Condition page not found.</p>
          <Link to="/" className="text-teal-600 font-semibold hover:underline">← Back to home</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="hero-gradient">
      {/* JSON-LD for this condition */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(condition.schema) }}
      />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://neohomeo.com" },
            { "@type": "ListItem", "position": 2, "name": "Conditions", "item": "https://neohomeo.com/conditions" },
            { "@type": "ListItem", "position": 3, "name": condition.name, "item": `https://neohomeo.com/conditions/${condition.slug}` },
          ],
        }) }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/90 px-6 py-3 flex items-center justify-between">
        <Link to="/"><NeoLogo compact /></Link>
        <nav className="hidden md:flex gap-6 text-xs font-bold text-teal-800 uppercase tracking-widest">
          <Link to="/#treatments" className="hover:text-teal-600 transition">Treatments</Link>
          <Link to="/#how" className="hover:text-teal-600 transition">How it works</Link>
          <Link to="/#faq" className="hover:text-teal-600 transition">FAQ</Link>
        </nav>
        <Link to="/signup" className="text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2 rounded-full shadow-md">
          Get started
        </Link>
      </header>

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 pt-6 text-xs text-teal-900/50 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-teal-700 transition">Home</Link>
        <span>/</span>
        <Link to="/#treatments" className="hover:text-teal-700 transition">Conditions</Link>
        <span>/</span>
        <span className="text-teal-800 font-medium">{condition.name}</span>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-16">

        {/* Hero */}
        <section className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-teal-700/60 font-bold mb-2">Homeopathic Treatment</p>
            <h1 className="text-4xl md:text-5xl font-black text-teal-950 leading-tight">{condition.headline}</h1>
            <p className="text-lg text-teal-900/65 mt-3">{condition.subline}</p>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
            className="text-teal-900/75 leading-relaxed max-w-2xl">
            {condition.intro}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-3">
            <Link to="/assessment"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition">
              Start free assessment →
            </Link>
            <Link to="/signup"
              className="bg-white text-teal-900 px-8 py-4 rounded-full font-bold border border-teal-100 hover:bg-teal-50 transition shadow-sm">
              Create account
            </Link>
          </motion.div>
        </section>

        {/* Symptoms + How it helps */}
        <section className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-semibold text-teal-950">Common symptoms we address</h2>
            <ul className="space-y-2.5">
              {condition.symptoms.map(s => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-teal-900/75">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-semibold text-teal-950">How homeopathy helps</h2>
            <ul className="space-y-2.5">
              {condition.howHelps.map(h => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-teal-900/75">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">→</span>
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* How it works strip */}
        <section className="glass-panel p-8 space-y-4">
          <h2 className="text-2xl font-light text-teal-950 text-center">How NeoHomeo works</h2>
          <div className="grid sm:grid-cols-4 gap-4 text-center">
            {[
              { n: "01", t: "AI assessment", b: "Dr. Neo takes your full symptom history" },
              { n: "02", t: "Doctor match", b: "Matched to the right specialist for your condition" },
              { n: "03", t: "Consultation", b: "Online video or audio visit" },
              { n: "04", t: "Treatment plan", b: "Remedies delivered to your door" },
            ].map(step => (
              <div key={step.n} className="space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-sm font-black text-white mx-auto">{step.n}</div>
                <p className="font-semibold text-teal-950 text-sm">{step.t}</p>
                <p className="text-xs text-teal-900/60">{step.b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-light text-teal-950">Frequently asked questions</h2>
          <div className="space-y-3">
            {condition.faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-panel p-10 text-center space-y-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-cyan-50/30 to-violet-50/40" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-light text-teal-950">Ready to start your {condition.name.toLowerCase()} treatment?</h2>
            <p className="text-teal-900/65 max-w-md mx-auto text-sm">
              Begin with a free AI assessment. Our doctors will review your case and build a personalised plan.
            </p>
            <Link to="/assessment"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition">
              Start free assessment →
            </Link>
          </div>
        </motion.section>

      </main>

      <footer className="border-t border-teal-100 py-6 text-center text-xs text-teal-800/40 mt-8">
        © {new Date().getFullYear()} NeoHomeo · Not a substitute for professional medical advice ·{" "}
        <Link to="/legal/disclaimer" className="hover:underline">Medical disclaimer</Link>
      </footer>
    </PageShell>
  );
}

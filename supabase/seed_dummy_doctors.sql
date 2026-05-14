-- Dummy approved doctors — idempotent (run in SQL Editor after migrations)
delete from public.doctors where email in (
  'kavitha.menon@example.com',
  'arjun.desai@example.com',
  'priya.nambiar@example.com',
  'imran.qureshi@example.com'
);

insert into public.doctors (
  full_name, email, phone, qualification, specialization, experience_years,
  clinic_name, clinic_address, consultation_fee, languages, bio, photo_url,
  calendly_url, match_keywords, rating, review_count, status
) values
(
  'Dr. Kavitha Menon',
  'kavitha.menon@example.com',
  '+91 98765 43210',
  'BHMS, MD (Hom)',
  'Migraine and stress-related headaches',
  14,
  'Menon Homoeo Clinic',
  'Indiranagar, Bengaluru',
  1400,
  array['English', 'Malayalam', 'Hindi'],
  'Focuses on menstrual migraine patterns, screen-related eye strain headaches, and sleep architecture.',
  null,
  'https://calendly.com/neohomeo-demo/kavitha-consult',
  'migraine,headache,stress,anxiety,sleep,menstrual,aura',
  4.9,
  128,
  'approved'
),
(
  'Dr. Arjun Desai',
  'arjun.desai@example.com',
  '+91 98200 11223',
  'BHMS',
  'Skin and allergy disorders',
  11,
  'Desai Skin & Allergy Centre',
  'Banjara Hills, Hyderabad',
  1200,
  array['English', 'Hindi', 'Telugu'],
  'Chronic urticaria, eczema flares, and seasonal allergic rhinitis with constitutional prescribing.',
  null,
  'https://calendly.com/neohomeo-demo/arjun-consult',
  'skin,eczema,allergy,urticaria,rhinitis,asthma,hay fever',
  4.85,
  96,
  'approved'
),
(
  'Dr. Priya Nambiar',
  'priya.nambiar@example.com',
  '+91 98470 55667',
  'BHMS, Fellowship Pediatric Homoeopathy',
  'Women''s health and PCOS',
  9,
  'Nambiar Women''s Wellness',
  'Edappally, Kochi',
  1500,
  array['English', 'Malayalam', 'Tamil'],
  'Cycle irregularity, metabolic PCOS, mood swings around ovulation, and post-pill transitions.',
  null,
  'https://calendly.com/neohomeo-demo/priya-consult',
  'pcos,thyroid,irregular periods,hormone,weight,acne,fatigue',
  4.95,
  74,
  'approved'
),
(
  'Dr. Imran Qureshi',
  'imran.qureshi@example.com',
  '+91 98112 33445',
  'BHMS, MD (Hom)',
  'Digestive and IBS patterns',
  16,
  'Qureshi Digestive Care',
  'Kurla West, Mumbai',
  1300,
  array['English', 'Hindi', 'Urdu'],
  'Bloating, post-meal acidity, IBS alternation, and stress-linked appetite changes.',
  null,
  'https://calendly.com/neohomeo-demo/imran-consult',
  'digestion,ibs,bloating,acidity,constipation,stomach,gut',
  4.88,
  142,
  'approved'
);

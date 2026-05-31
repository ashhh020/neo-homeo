export interface Medicine {
  letter: string; // "A"
  name: string;   // "Abies Canadensis"
  abbr: string;   // "abies-c"
  path: string;   // "a/abies-c.htm"
}

export interface MedicineSection {
  heading: string;
  content: string;
}

export interface MedicineData {
  title: string;
  intro: string;
  sections: MedicineSection[];
  dose: string;
}

export type StudentTab = "chat" | "medicine";

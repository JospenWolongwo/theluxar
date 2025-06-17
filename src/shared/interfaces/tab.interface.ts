export interface Tab {
  id: string;
  label: string;
  active: boolean;
}

export interface SpecSection {
  title: string;
  specs: { label: string; value: string }[];
}

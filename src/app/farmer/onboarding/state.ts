export type FarmSetupState = {
  farmName: string;
  county: string;
  subCounty: string;
  phone: string;
  preferredLanguage: string;
  locationText: string;
  flockType: string;
  birdCount: string;
  db: string;
};

export const initialFarmSetupState: FarmSetupState = {
  farmName: "",
  county: "",
  subCounty: "",
  phone: "",
  preferredLanguage: "",
  locationText: "",
  flockType: "",
  birdCount: "",
  db: "",
};
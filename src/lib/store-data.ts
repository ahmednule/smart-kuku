import type { TLocation } from "./types";

export type LocalStoreProduct = {
  id: string;
  price: number;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  currencySymbol: string;
  description: string;
  images: string[];
  product: {
    id: string;
    name: string;
  };
  supplier: {
    id: string;
    name: string;
  };
};

export const LOCAL_STORE_PRODUCTS: LocalStoreProduct[] = [
  {
    id: "local-prod-1",
    price: 1850,
    city: "Nairobi",
    region: "Nairobi County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Broad-spectrum poultry-safe house spray for red mites and fowl ticks. Suitable for layer and broiler house surfaces.",
    images: [
      "/assets/images/resources/pests-external-parasites.svg",
      "/assets/images/resources/pests-housing-hygiene.svg",
    ],
    product: {
      id: "p-local-1",
      name: "Mite and Tick House Spray",
    },
    supplier: {
      id: "s-local-1",
      name: "Nairobi Poultry Vet Supplies",
    },
  },
  {
    id: "local-prod-2",
    price: 1250,
    city: "Nairobi",
    region: "Nairobi County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Dry-powder treatment for poultry lice and sticktight fleas. Helps reduce irritation and feather damage.",
    images: [
      "/assets/images/resources/pests-external-parasites.svg",
      "/assets/images/resources/pests-litter-management.svg",
    ],
    product: {
      id: "p-local-2",
      name: "Poultry Lice and Flea Dust",
    },
    supplier: {
      id: "s-local-1",
      name: "Nairobi Poultry Vet Supplies",
    },
  },
  {
    id: "local-prod-3",
    price: 2100,
    city: "Nakuru",
    region: "Nakuru County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Heavy-duty bait station and trap set for poultry feed store rodent control.",
    images: [
      "/assets/images/resources/pests-rodent-control.svg",
      "/assets/images/resources/pests-housing-hygiene.svg",
    ],
    product: {
      id: "p-local-3",
      name: "Rodent Guard Trap Kit",
    },
    supplier: {
      id: "s-local-2",
      name: "Rift Valley Agro Depot",
    },
  },
  {
    id: "local-prod-4",
    price: 2700,
    city: "Nakuru",
    region: "Nakuru County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Disinfectant and litter conditioner combo to reduce darkling beetles and poultry house pathogen pressure.",
    images: [
      "/assets/images/resources/pests-litter-management.svg",
      "/assets/images/resources/diseases-biosecurity.svg",
    ],
    product: {
      id: "p-local-4",
      name: "Litter Shield Disinfectant Pack",
    },
    supplier: {
      id: "s-local-2",
      name: "Rift Valley Agro Depot",
    },
  },
  {
    id: "local-prod-5",
    price: 1450,
    city: "Kisumu",
    region: "Kisumu County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Electrolyte and vitamin support for poultry flocks under respiratory disease stress or post-treatment recovery.",
    images: [
      "/assets/images/resources/diseases-treatment-plan.svg",
      "/assets/images/resources/diseases-flock-observation.svg",
    ],
    product: {
      id: "p-local-5",
      name: "Respiratory Recovery Booster",
    },
    supplier: {
      id: "s-local-3",
      name: "Lake Region Poultry Care",
    },
  },
  {
    id: "local-prod-6",
    price: 1950,
    city: "Kisumu",
    region: "Kisumu County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Farm biosecurity starter kit with footbath concentrate, glove packs, and entry-point control supplies.",
    images: [
      "/assets/images/resources/diseases-biosecurity.svg",
      "/assets/images/resources/diseases-viral-watch.svg",
    ],
    product: {
      id: "p-local-6",
      name: "Biosecurity Entry Kit",
    },
    supplier: {
      id: "s-local-3",
      name: "Lake Region Poultry Care",
    },
  },
  {
    id: "local-prod-7",
    price: 1600,
    city: "Mombasa",
    region: "Mombasa County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Coccidiosis management pack with water-soluble support blend and brooder litter moisture guide.",
    images: [
      "/assets/images/resources/diseases-treatment-plan.svg",
      "/assets/images/resources/pests-litter-management.svg",
    ],
    product: {
      id: "p-local-7",
      name: "Coccidiosis Support Pack",
    },
    supplier: {
      id: "s-local-4",
      name: "Coastline Vet and Agro",
    },
  },
  {
    id: "local-prod-8",
    price: 3200,
    city: "Mombasa",
    region: "Mombasa County",
    country: "Kenya",
    countryCode: "KE",
    currencySymbol: "Ksh",
    description:
      "Cold-chain vaccination support bundle for Newcastle and related flock immunization schedules.",
    images: [
      "/assets/images/resources/diseases-viral-watch.svg",
      "/assets/images/resources/diseases-biosecurity.svg",
    ],
    product: {
      id: "p-local-8",
      name: "Poultry Vaccine Cold Box Set",
    },
    supplier: {
      id: "s-local-4",
      name: "Coastline Vet and Agro",
    },
  },
];

export const LOCAL_PRODUCT_LOCATIONS: TLocation[] = Array.from(
  new Map(
    LOCAL_STORE_PRODUCTS.map((product) => [
      `${product.city}-${product.region}-${product.country}`,
      {
        id: `loc-${product.city}-${product.region}-${product.country}`,
        countryCode: product.countryCode,
        currencySymbol: product.currencySymbol,
        city: product.city,
        country: product.country,
        region: product.region,
      },
    ])
  ).values()
);

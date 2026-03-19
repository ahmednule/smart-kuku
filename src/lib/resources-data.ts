export type StaticResource = {
  id: string;
  name: string;
  slug: string;
  text: string;
  images: string[];
};

export const STATIC_PESTS: StaticResource[] = [
  {
    id: "pest-1",
    name: "Red Mites",
    slug: "red-mites",
    text: `## Overview
Red mites are one of the most common external pests in layer and breeder houses. They feed on blood at night and hide in cracks during the day.

## Early Signs
- Birds become restless on perches at night
- Pale combs and reduced egg production
- Small gray or red specks in cage joints and wooden cracks

## Immediate Action
1. Remove litter and deep-clean cracks, perches, and nesting areas.
2. Apply approved mite treatment to housing surfaces.
3. Repeat treatment in 5-7 days to interrupt the life cycle.

## Prevention
Inspect layer houses weekly, especially around perches, and maintain strict cleaning between batches.`,
    images: [
      "/assets/images/resources/pests-external-parasites.svg",
      "/assets/images/resources/pests-housing-hygiene.svg",
    ],
  },
  {
    id: "pest-2",
    name: "Poultry Lice",
    slug: "poultry-lice",
    text: `## Overview
Poultry lice live on feathers and skin and are common in free-range and backyard flocks.

## Early Signs
- Frequent scratching and feather pecking
- Broken feathers around vent and under wings
- Poor growth in chicks and growers

## Immediate Action
1. Separate heavily affected birds where possible.
2. Treat birds and litter with approved poultry lice control.
3. Replace nesting material and clean roosting areas.

## Prevention
Provide dry dust-bathing zones and inspect flock body condition every two weeks.`,
    images: [
      "/assets/images/resources/pests-external-parasites.svg",
      "/assets/images/resources/pests-litter-management.svg",
    ],
  },
  {
    id: "pest-3",
    name: "Sticktight Fleas",
    slug: "sticktight-fleas",
    text: `## Overview
Sticktight fleas attach around comb, wattles, and eyelids, causing irritation and reduced feeding.

## Early Signs
- Birds shaking heads and scratching face region
- Dark clustered spots near eyes and comb
- Poor appetite and stress in broilers and pullets

## Immediate Action
1. Treat birds and surrounding bedding immediately.
2. Clean and disinfect nest boxes and corners.
3. Repeat treatment as directed to clear newly emerged fleas.

## Prevention
Maintain dry litter, reduce wild-bird contact, and inspect face areas during routine checks.`,
    images: [
      "/assets/images/resources/pests-external-parasites.svg",
      "/assets/images/resources/pests-litter-management.svg",
    ],
  },
  {
    id: "pest-4",
    name: "Fowl Ticks",
    slug: "fowl-ticks",
    text: `## Overview
Fowl ticks feed on poultry blood and can spread infections in poorly managed houses.

## Early Signs
- Visible ticks around vent, neck, or under wings
- Weakness and reduced feed intake
- Restless birds in hot or humid periods

## Immediate Action
1. Remove visible ticks and treat birds with approved products.
2. Spray cracks, walls, and perches where ticks hide.
3. Clear vegetation and debris around poultry houses.

## Prevention
Maintain perimeter hygiene and schedule regular ectoparasite control in all poultry units.`,
    images: [
      "/assets/images/resources/pests-external-parasites.svg",
      "/assets/images/resources/pests-housing-hygiene.svg",
    ],
  },
  {
    id: "pest-5",
    name: "Darkling Beetles",
    slug: "darkling-beetles",
    text: `## Overview
Darkling beetles thrive in poultry litter and can carry pathogens between flocks.

## Early Signs
- Beetles seen in litter, insulation, or wall cracks
- Increased contamination risk in broiler houses
- Persistent house odor and damp litter pockets

## Immediate Action
1. Remove wet litter and improve floor dryness.
2. Clean and disinfect between production cycles.
3. Treat structural hiding points as per farm protocol.

## Prevention
Keep litter dry, rotate bedding properly, and enforce strict house turnaround hygiene.`,
    images: [
      "/assets/images/resources/pests-litter-management.svg",
      "/assets/images/resources/pests-housing-hygiene.svg",
    ],
  },
  {
    id: "pest-6",
    name: "Rodents",
    slug: "rodents",
    text: `## Overview
Rodents consume feed, damage infrastructure, and can contaminate water and feed stores.

## Early Signs
- Feed losses not matching flock numbers
- Gnaw marks on feed bags and wooden structures
- Droppings near storage points

## Immediate Action
1. Seal feed in rodent-proof containers.
2. Set traps around walls and feed stores.
3. Close entry holes in buildings.

## Prevention
Enforce strict feed storage hygiene and remove spilled feed daily.`,
    images: [
      "/assets/images/resources/pests-rodent-control.svg",
      "/assets/images/resources/pests-housing-hygiene.svg",
    ],
  },
];

export const STATIC_DISEASES: StaticResource[] = [
  {
    id: "disease-1",
    name: "Newcastle Disease",
    slug: "newcastle-disease",
    text: `## Overview
Newcastle disease is a fast-spreading viral disease with high flock impact when unmanaged.

## Symptoms
- Sudden drop in egg production
- Greenish diarrhea
- Twisted neck or paralysis in severe cases

## Response
1. Isolate sick birds immediately.
2. Inform a vet or extension officer.
3. Strengthen biosecurity and limit movement.

## Prevention
Follow strict vaccination schedules and maintain visitor control at farm entry points.`,
    images: [
      "/assets/images/resources/diseases-viral-watch.svg",
      "/assets/images/resources/diseases-biosecurity.svg",
    ],
  },
  {
    id: "disease-2",
    name: "Coccidiosis",
    slug: "coccidiosis",
    text: `## Overview
Coccidiosis is a parasitic intestinal disease common in wet, contaminated litter.

## Symptoms
- Bloody or watery droppings
- Weakness and huddling
- Poor feed conversion

## Response
1. Start anticoccidial treatment under veterinary guidance.
2. Replace wet litter and improve ventilation.
3. Ensure clean water access for all birds.

## Prevention
Keep litter dry and rotate anticoccidials where recommended.`,
    images: [
      "/assets/images/resources/diseases-treatment-plan.svg",
      "/assets/images/resources/diseases-flock-observation.svg",
    ],
  },
  {
    id: "disease-3",
    name: "Fowl Typhoid",
    slug: "fowl-typhoid",
    text: `## Overview
Fowl typhoid is a bacterial disease that can cause serious mortality in all ages.

## Symptoms
- High fever and depression
- Pale combs
- Reduced appetite and diarrhea

## Response
1. Confirm diagnosis with a vet.
2. Treat according to lab and veterinary guidance.
3. Sanitize drinkers and feeders daily.

## Prevention
Source chicks from trusted hatcheries and quarantine new stock before mixing.`,
    images: [
      "/assets/images/resources/diseases-treatment-plan.svg",
      "/assets/images/resources/diseases-biosecurity.svg",
    ],
  },
  {
    id: "disease-4",
    name: "Infectious Bursal Disease",
    slug: "infectious-bursal-disease",
    text: `## Overview
Also called Gumboro, this viral disease weakens immunity, especially in young birds.

## Symptoms
- Tremors and depression
- Ruffled feathers
- Sudden mortality spikes in growers

## Response
1. Isolate affected groups.
2. Review vaccine timing with your vet.
3. Improve sanitation and stress control.

## Prevention
Use age-appropriate vaccination programs and clean brooding equipment thoroughly.`,
    images: [
      "/assets/images/resources/diseases-viral-watch.svg",
      "/assets/images/resources/diseases-flock-observation.svg",
    ],
  },
  {
    id: "disease-5",
    name: "Fowl Pox",
    slug: "fowl-pox",
    text: `## Overview
Fowl pox presents as skin lesions and can reduce growth and laying performance.

## Symptoms
- Wart-like scabs on comb and wattles
- Breathing difficulty in wet form
- Reduced feed intake

## Response
1. Separate visibly affected birds.
2. Apply supportive care and monitor hydration.
3. Control mosquitoes and biting insects.

## Prevention
Vaccinate where risk is high and eliminate standing water near poultry units.`,
    images: [
      "/assets/images/resources/diseases-flock-observation.svg",
      "/assets/images/resources/diseases-treatment-plan.svg",
    ],
  },
  {
    id: "disease-6",
    name: "Avian Influenza",
    slug: "avian-influenza",
    text: `## Overview
Avian influenza is a highly contagious viral disease in poultry with major economic and food-security impact.

## Symptoms
- Sudden high mortality in chickens or ducks
- Swollen head, comb, or wattles
- Sharp drop in egg production and severe depression

## Response
1. Isolate the unit and stop bird movement immediately.
2. Report urgently to veterinary authorities.
3. Follow official disease-control and disposal guidance.

## Prevention
Enforce strict farm biosecurity, control visitors, and separate domestic poultry from wild birds.`,
    images: [
      "/assets/images/resources/diseases-viral-watch.svg",
      "/assets/images/resources/diseases-biosecurity.svg",
    ],
  },
];

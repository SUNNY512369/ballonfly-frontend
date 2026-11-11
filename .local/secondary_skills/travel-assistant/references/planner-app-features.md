# Planner App Features

Read this when building a web-based travel planner, after the map and itinerary views in the entrypoint are planned. It covers AI recommendations, real-time data, transportation, packing lists, templates, multi-region trips, the feature checklist, design defaults, and PDF export.

## AI-Powered Recommendations

Use AI integrations to generate smarter, personalized content rather than relying solely on hardcoded data:

- **Destination research** — Use an AI model to research destinations based on the user's preferences (travel style, group composition, interests) and generate tailored restaurant, activity, and accommodation suggestions.
- **Seasonality awareness** — Factor in the time of year when recommending activities. Suggest outdoor markets and harvest festivals in fall, ski resorts in winter, beaches and hiking in summer, cherry blossoms in spring. Flag activities that may be closed or less enjoyable in the chosen season.
- **Personalization** — Adjust recommendations based on group composition. A trip with babies should emphasize stroller-friendly paths, early dinner reservations, and nap-friendly schedules. A trip with adventurous adults should prioritize hikes, wine tours, and late-night dining.
- **Local events** — Research festivals, concerts, exhibitions, and seasonal markets happening during the travel dates and suggest them as bonus activities.

## Real-Time Data Integration

Where possible, enrich the planner with live information:

- **Weather forecasts** — Pull weather data for the travel dates and destination. Show expected conditions on each day card. Use this to inform rain plan recommendations.
- **Exchange rates** — For international trips, show current exchange rates and convert budget estimates to the traveler's home currency.
- **Event calendars** — Check for local holidays, festivals, and closures that affect the itinerary.
- **Venue hours and closures** — Verify opening hours and seasonal closures. Flag restaurants closed on specific days (e.g., many Italian restaurants close Mondays). Alert if a suggested venue is likely to be closed on the planned visit day.
- **Implementation** — Use web search or external APIs to fetch this data. Cache results to avoid repeated lookups. Display weather/events as supplementary info on day cards, not as blocking requirements.

## Transportation Planning

Include travel logistics between stops:

- **Driving/transit times** — Show estimated travel time between each day's activities. This helps users judge whether a day plan is realistic. Use Google Maps distance estimates or similar.
- **Optimal routing** — If a day has multiple stops, suggest the best order to minimize driving. Group nearby activities together.
- **Transfer days** — For multi-region trips, explicitly plan transfer days with:
  - Departure and arrival times
  - Recommended routes (scenic vs. fastest)
  - Luggage logistics (hotel checkout times, car rental pickups/dropoffs)
  - Suggested stops along the way (rest stops, scenic viewpoints, lunch spots)
- **Transport modes** — Note whether each leg is best done by car, train, bus, ferry, cable car, or walking. Include ticket booking links where applicable.
- **Data model** — Add transport-related fields to the day itinerary, using the `TransportLeg` type in [data-model.md](data-model.md).

## Packing List Generator

Based on trip parameters, generate a suggested packing list:

- **Weather-based** — Pull expected weather for the destinations and dates. Suggest layers for variable weather, rain gear if rain is likely, sun protection for warm destinations.
- **Activity-based** — Add items based on planned activities (hiking boots for mountain trails, swimsuit for lake/beach, smart casual for fine dining, comfortable shoes for city walking).
- **Baby/child-specific** — If traveling with babies or young children, suggest: portable high chair, stroller rain cover, baby carrier for trails, snacks, entertainment for transit, travel crib if not provided by accommodation.
- **Destination-specific** — Note cultural requirements (modest dress for religious sites, specific adapter types for power outlets, local SIM card recommendations).
- **Duration-based** — Scale quantities to trip length. Suggest laundry considerations for trips over a week.
- **Categorize the list** — Group items by: Clothing, Toiletries, Electronics, Documents, Baby/Kids, Activity Gear, Miscellaneous.

## Trip Templates

Save and reuse trip structures:

- **Save as template** — Allow completed trip plans to be saved as reusable templates. Strip personal details but keep the structure, venue recommendations, and day flow.
- **Template library** — Maintain a collection of proven itineraries that can serve as starting points. Tag templates by destination, duration, travel style, and group type.
- **Customizable templates** — When loading a template, let users adjust dates, swap venues, and modify the pace while keeping the overall structure.
- **Implementation** — Store templates as JSON files with the full itinerary structure. Include metadata (destination, duration, style, best season, group type) for search and filtering.

## Multi-Region Trip Logic

Handle trips that span multiple destinations or regions:

- **Region segmentation** — Clearly separate the itinerary into region blocks (e.g., "Lake Garda — Days 1-7" and "Dolomites — Days 8-14"). Use visual badges and color coding to distinguish regions.
- **Transfer planning** — Automatically identify transfer days between regions. Suggest departure times, scenic routes, and midway lunch stops.
- **Region-specific recommendations** — Tailor restaurant and activity suggestions to each region. Don't suggest a Lake Garda restaurant for a Dolomites day.
- **Luggage logistics** — Note when hotel changes require packing up. Suggest leaving heavy luggage at a storage point if doing a day trip before checking into the next region's accommodation.
- **Suggested day allocation** — Based on the number of attractions and the pace preference, suggest how many days to allocate to each region. Flag if a region is over-packed or under-utilized.

## Feature Checklist

For a full-featured web-based travel planner, include:

- [ ] Day-by-day itinerary (timeline view)
- [ ] Board/Kanban view for visual overview
- [ ] Restaurant catalog with filters and "Add to Day" picker
- [ ] Activity catalog with category filters and "Add to Day" picker
- [ ] Selection system (context/state) for assigning items to days
- [ ] "Your Picks" section on each day showing assigned restaurants/activities
- [ ] Interactive map with color-coded markers
- [ ] Accommodation recommendations
- [ ] Budget breakdown with per-day and per-person views
- [ ] PDF export of full itinerary (including picks, alternatives, rain plans)
- [ ] Map, website, and booking links on every venue card
- [ ] Dining and activity alternatives per day
- [ ] Rain/bad weather backup plans
- [ ] Region badges on day cards
- [ ] Transportation time estimates between stops
- [ ] Packing list generator
- [ ] Weather forecast integration
- [ ] Currency conversion for international trips
- [ ] Persistent state (localStorage or backend)
- [ ] Mobile-responsive design

## Design Defaults

For travel planners, warm and inviting palettes work well:

- Use destination-inspired colors (e.g., terracotta/olive/amber for Italy, blue/white for Greece, red/gold for Japan, sage/slate for Scandinavia)
- Serif headings (Playfair Display, Cormorant) + clean sans-serif body (DM Sans, Inter)
- Subtle animations for expanding sections (Framer Motion)
- Card-based layouts for restaurants and activities
- Cream/warm backgrounds rather than pure white
- Region-specific accent colors for multi-destination trips

## PDF Export Implementation

When generating PDFs with jspdf:

- Paint page backgrounds only on new pages (in `addPage` callback), never re-paint over existing content in loops
- Use a `checkPageBreak` helper that handles both page breaks and background painting
- Include: header with trip title/dates, day sections with activities, selected picks, alternatives, rain plans, page numbers
- Style consistently with the web app's color palette
- Include packing list as a final section if generated
- Add a budget summary page at the end

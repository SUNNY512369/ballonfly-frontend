# Booking and Availability Integrations

Read this when a planner app needs booking and availability context: live availability, prices, reviews, or booking links from travel platforms.

The app should connect to travel platforms for live data where possible, and fall back to deep links when direct integration isn't available.

## Target platforms and their capabilities

- **Accommodations**: Booking.com, Airbnb, Expedia, Hotels.com — search availability by dates/location/group size, show prices, ratings, reviews, photos, amenities, cancellation policies
- **Restaurants**: OpenTable, TheFork, Resy — search availability by date/time/party size, show ratings, reviews, cuisine type, price tier, reservation slots
- **Activities/Experiences**: GetYourGuide, Viator, Fever, Klook — search by destination/dates, show availability, prices, ratings, reviews, duration, cancellation policy
- **Transportation**: Trainline, Rome2Rio, FlixBus, local transit APIs — search routes, schedules, prices, duration between destinations
- **Car Rental**: Rentalcars.com, AutoEurope — search by pickup/dropoff location and dates, show vehicle options, prices, insurance

## Integration approach (in priority order)

1. **Replit integrations** — Check if a Replit integration exists for any of these platforms. If so, use it for direct API access (availability search, reviews, pricing). This is the preferred method.
2. **Direct APIs** — If no Replit integration exists but the platform offers a public or partner API (e.g., Booking.com Affiliate API, GetYourGuide Partner API), use it with appropriate API keys stored as secrets.
3. **Web search enrichment** — Use web search to find current reviews, ratings, prices, and availability for venues. Parse and display relevant data.
4. **Deep links as fallback** — When no API access is available, generate deep links that pre-fill search parameters on the platform:
   - Booking.com: `https://www.booking.com/searchresults.html?ss={destination}&checkin={date}&checkout={date}&group_adults={n}&group_children={n}`
   - Airbnb: `https://www.airbnb.com/s/{destination}/homes?checkin={date}&checkout={date}&adults={n}&children={n}&infants={n}`
   - OpenTable: `https://www.opentable.com/s?term={restaurant}&covers={n}&dateTime={datetime}`
   - GetYourGuide: `https://www.getyourguide.com/s/?q={activity}&date_from={date}&date_to={date}`
   - Expedia: `https://www.expedia.com/Hotel-Search?destination={destination}&startDate={date}&endDate={date}&rooms=1&adults={n}`

## Data to surface from these platforms when available

- Availability status (available / sold out / limited)
- Price range and specific pricing
- User ratings and review count
- Photos
- Cancellation/refund policy
- Key amenities or highlights
- Booking confirmation status

**Important:** Always check for new Replit integrations before falling back to deep links. The integration landscape evolves — what isn't available today may be available tomorrow.

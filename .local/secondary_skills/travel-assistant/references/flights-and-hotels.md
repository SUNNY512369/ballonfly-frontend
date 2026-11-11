# Flights and Accommodations

Read this when searching for or presenting flights or accommodations.

## Flights

Search for flights using `webSearch` with queries like `"Google Flights [origin] to [destination] [dates]"`, `"Skyscanner [origin] to [destination] [month]"`.

Present options with **direct links** to booking/search pages:

```text
**Option 1: [Airline] — $XXX roundtrip**
- Outbound: [date], [time] [origin] → [time] [dest] (Xh Xm, nonstop/1 stop)
- Return: [date], [time] [dest] → [time] [origin] (Xh Xm, nonstop/1 stop)
- [Google Flights link](URL) | [Book direct with airline](URL)

**Option 2: [Airline] — $XXX roundtrip**
...
```

Include at least 3 options when possible: cheapest, best schedule, best airline. Note open-jaw options if doing a multi-city trip.

### Flight search tools — use multiple, they surface different fares

| Tool | What it's best at |
|------|-------------------|
| Google Flights | Speed; calendar price grid; search up to 7 origin + 7 destination airports at once; price-history graph shows if "now" is cheap |
| Skyscanner | "Everywhere" destination (cheapest places from your airport, sorted by price); "Whole month" date view; surfaces budget carriers Google misses |
| Skiplagged | Hidden-city fares — flight A→C with layover at B is cheaper than A→B, so you get off at B. Savings up to 60%. **Constraints:** carry-on only (checked bags go to C), one-way only (skipping a leg cancels the rest), don't do it repeatedly on the same airline (they ban accounts) |
| Going.com / Secret Flying | Error fares, mistake prices — time-sensitive |

### Booking rules

- Find the fare on an aggregator → **book direct with the airline.** OTAs (Expedia etc.) are useless when flights get cancelled — airline agents will say "call Expedia"
- Domestic sweet spot: 1-3 months out. International: 2-6 months. Last-minute is almost always worse except on empty routes
- Tuesday/Wednesday/Saturday departures are typically cheapest
- Open-jaw (fly into city A, out of city B) via multi-city search — often cheaper than round-trip + ground transport

## Hotels / Accommodations

Search using `webSearch` for hotels in the destination area with queries like `"best hotels [neighborhood] [city] [budget level]"`, `"[city] hotels [dates] site:booking.com"`, `"[city] airbnb [neighborhood]"`.

Present options with **direct links**:

```text
**[Hotel Name]** — $XXX/night | [neighborhood] | [rating] stars
- [Key feature 1], [key feature 2] (e.g., rooftop pool, walkable to old town, free breakfast)
- [Booking.com link](URL) | [Hotel website](URL)

**[Hotel/Airbnb Name]** — $XXX/night | [neighborhood] | [rating]
...
```

Include 3-5 options spanning the user's budget range. Note the neighborhood and why it's a good base. For multi-city trips, list accommodations per city.

| Platform | Best for |
|----------|----------|
| Booking.com | Widest hotel inventory, free cancellation options, price match |
| Airbnb | Apartments, longer stays, groups, kitchens |
| Hostelworld | Budget/social travelers |
| Hotel direct sites | Loyalty perks, best-rate guarantees |

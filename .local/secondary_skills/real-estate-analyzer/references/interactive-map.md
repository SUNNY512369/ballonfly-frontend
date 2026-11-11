# Interactive Map — Web App Visualization

After analyzing properties, **build a web app** that displays properties and relevant neighborhood data on an interactive map.

## Property Markers

- **Color-coded by recommendation**: green = Strong Buy, blue = Buy, yellow = Hold, red = Pass
- **Popup on each marker** showing: address, asking price, estimated fair value, beds/baths, sqft, price/sqft, and recommendation
- **Click to expand** with key details: comp-adjusted value, cap rate (if investment), flood zone, school rating

## Neighborhood Context Layers

Display relevant context around the properties:

- **Sold comps** — recent comparable sales as smaller markers, with sale price and date
- **School locations** with GreatSchools ratings (color-coded: green ≥7, yellow 4-6, red <4)
- **Flood zones** if any properties are in or near FEMA Zone A/AE/V
- **Nearby amenities** — transit, grocery, parks when walkability matters to the user

## Geocoding

Use the free Nominatim API (OpenStreetMap) to convert addresses to lat/lng — no API key required:

```text
https://nominatim.openstreetmap.org/search?q={url_encoded_address}&format=json&limit=1
```

Rate limit: max 1 request/second. Batch geocode all addresses before building the map.

Always generate the map alongside the text-based analysis — the map is a visual complement, not a replacement for the detailed evaluation.

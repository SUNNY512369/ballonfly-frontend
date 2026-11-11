# Planner Data Model

Read this when defining the venue, booking, or transport types for a planner app.

## Venue data

Structure venue data with these fields from the start:

```typescript
interface BookingInfo {
  platform: string;
  deepLink: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  availability?: 'available' | 'limited' | 'sold-out' | 'unknown';
  cancellationPolicy?: string;
  lastChecked?: string;
}

interface Restaurant {
  id: string;
  name: string;
  city: string;
  region: string;
  cuisine: string;
  priceRange: string;
  description: string;
  mustTry: string;
  familyFriendly: boolean;
  mapLink: string;
  websiteLink?: string;
  bookingInfo?: BookingInfo[];
  michelinStatus?: string;
  closedOn?: string[];
  suggestedMeal: 'lunch' | 'dinner' | 'either';
  suggestedDays?: number[];
}

interface Activity {
  id: string;
  name: string;
  city: string;
  region: string;
  category: string;
  duration: string;
  priceRange: string;
  description: string;
  highlights: string[];
  familyFriendly: boolean;
  strollerAccessible: boolean;
  mapLink: string;
  websiteLink?: string;
  bookingInfo?: BookingInfo[];
  seasonalAvailability?: string[];
  suggestedDays?: number[];
}

interface Accommodation {
  id: string;
  name: string;
  region: string;
  stars: number;
  priceRange: string;
  features: string[];
  familyFriendly: boolean;
  babyFriendly: boolean;
  mapLink: string;
  websiteLink: string;
  bookingInfo?: BookingInfo[];
  checkInTime?: string;
  checkOutTime?: string;
  why: string;
}
```

## Transport legs

Add transport-related fields to the day itinerary:

```typescript
interface TransportLeg {
  from: string;
  to: string;
  mode: 'car' | 'train' | 'bus' | 'ferry' | 'cable-car' | 'walking' | 'flight';
  durationMinutes: number;
  distance?: string;
  notes?: string;
  bookingLink?: string;
}

interface DayItinerary {
  // ...existing fields...
  transport?: TransportLeg[];
}
```

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Transform a single spot row, then upload to the API.

1. Parse lat/lng from Google Maps URL deterministically
2. Reverse geocode via Nominatim (free) to get province/district

Category mapping is done deterministically in Python.

Usage:
    python transform_spot.py '{"name": "...", "province": "...", ...}'
"""

import json
import os
import re
import sys
import time
import requests
import anthropic

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")
API_KEY = os.getenv("SCRAPER_API_KEY", "your-api-key-here")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

ai_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# CSV category -> categoryId (matches seed.sql categories table IDs)
CATEGORY_ID_MAPPING = {
    # Food & Beverage
    "cafe": "food-cafe", "restaurant": "food-restaurant",
    "bar": "food-bar", "bakery": "food-bakery",
    "confectionery": "food-bakery", "fast_food": "food-restaurant",
    "food_court": "food-restaurant", "ice_cream": "food-cafe",
    "beverages": "food-cafe", "deli": "food-restaurant",
    "seafood": "food-restaurant", "butcher": "food-restaurant",
    # Accommodation
    "hotel": "accommodation-hotel", "hostel": "accommodation-hostel",
    "resort": "accommodation-resort", "guesthouse": "accommodation-hostel",
    "apartment": "accommodation-hotel",
    # Shopping
    "electronics": "shopping-electronics", "clothing": "shopping-fashion",
    "grocery": "shopping-grocery", "supermarket": "shopping-grocery",
    "convenience": "shopping-grocery", "general_store": "shopping-grocery",
    "marketplace": "shopping-retail", "second_hand": "shopping-retail",
    "jewelry": "shopping-retail", "kiosk": "shopping-retail",
    "furniture": "shopping-retail", "hardware": "shopping-retail",
    "leather": "shopping-fashion",
    # Services
    "hairdresser": "services-barber", "beauty": "services-salon",
    "laundry": "services-laundry", "repair": "services-repair",
    "tailor": "services-salon", "optician": "services-repair",
    "camera": "services-repair", "copyshop": "services-repair",
    "clockmaker": "services-repair", "shipping": "services-repair",
    "insurance": "services-repair", "car_wash": "services-repair",
    "vehicle_inspection": "services-repair",
    # Health & Wellness
    "pharmacy": "health-pharmacy", "clinic": "health-clinic",
    "dentist": "health-clinic", "gym": "health-gym",
    "massage": "health-spa", "spa": "health-spa",
    "counselling": "health-clinic", "physiotherapy": "health-clinic",
    "veterinary": "health-clinic", "herbalist": "health-pharmacy",
    "alternative_medicine": "health-clinic",
    # Entertainment
    "arcade": "entertainment-gaming", "theme_park": "entertainment-gaming",
    "gallery": "entertainment-cinema", "studio": "entertainment-cinema",
    # Transportation
    "motorcycle_rental": "transport-bike", "taxi": "transport-taxi",
    "guide": "transport-taxi",
    # Community
    "coworking": "community-coworking", "training": "community-education",
    "school": "community-education", "community_centre": "community-community-space",
    "hackerspace": "community-coworking", "place_of_worship": "community-community-space",
    # Other
    "cannabis": "other-cannabis", "pet": "other-pet",
    "tattoo": "other-art", "garden": "other-general",
    "farm": "other-general", "real_estate": "other-general",
    "consulting": "other-general", "lawyer": "other-general",
    "exchange": "other-general", "lottery": "other-general",
    "brewery": "other-general", "campsite": "other-general",
    "parking": "other-general", "other": "other-general",
    "online": "other-general",
}

# Thailand bounding box for sanity checking coordinates
THAILAND_LAT_MIN, THAILAND_LAT_MAX = 5.5, 20.5
THAILAND_LNG_MIN, THAILAND_LNG_MAX = 97.0, 106.0


def is_valid_thailand_coord(lat: float, lng: float) -> bool:
    return (THAILAND_LAT_MIN <= lat <= THAILAND_LAT_MAX and
            THAILAND_LNG_MIN <= lng <= THAILAND_LNG_MAX)


def extract_coords_from_url(url: str) -> tuple[float | None, float | None]:
    """Extract lat/lng from Google Maps URL patterns deterministically."""
    # Pattern 1: @lat,lng,zoom
    m = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
    if m:
        lat, lng = float(m.group(1)), float(m.group(2))
        if is_valid_thailand_coord(lat, lng):
            return lat, lng

    # Pattern 2: !3dlat!4dlng (Google Maps embed/internal format)
    m_lat = re.search(r'!3d(-?\d+\.\d+)', url)
    m_lng = re.search(r'!4d(-?\d+\.\d+)', url)
    if m_lat and m_lng:
        lat, lng = float(m_lat.group(1)), float(m_lng.group(1))
        if is_valid_thailand_coord(lat, lng):
            return lat, lng

    # Pattern 3: q=lat,lng or query=lat,lng
    m = re.search(r'[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)', url)
    if m:
        lat, lng = float(m.group(1)), float(m.group(2))
        if is_valid_thailand_coord(lat, lng):
            return lat, lng

    # Pattern 4: /dir/lat,lng or /place/lat,lng
    m = re.search(r'/(?:dir|place)/[^/]*?(-?\d+\.\d+),(-?\d+\.\d+)', url)
    if m:
        lat, lng = float(m.group(1)), float(m.group(2))
        if is_valid_thailand_coord(lat, lng):
            return lat, lng

    return None, None


def resolve_short_url(url: str) -> str:
    """Resolve short URLs (maps.app.goo.gl, goo.gl/maps) to get the full URL."""
    if 'goo.gl' not in url and 'maps.app' not in url:
        return url
    try:
        resp = requests.head(url, allow_redirects=True, timeout=10)
        return resp.url
    except Exception:
        try:
            resp = requests.get(url, allow_redirects=True, timeout=10)
            return resp.url
        except Exception:
            return url


def reverse_geocode(lat: float, lng: float) -> dict:
    """Use Nominatim to reverse geocode coordinates into province/district."""
    try:
        resp = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": lat,
                "lon": lng,
                "format": "json",
                "accept-language": "en",
                "zoom": 14,
            },
            headers={"User-Agent": "WelB-Spot-Scraper/1.0"},
            timeout=10,
        )
        data = resp.json()
        address = data.get("address", {})

        province = (address.get("state") or address.get("province")
                    or address.get("city") or "")
        # Clean up "Province" suffix that Nominatim sometimes adds
        province = re.sub(r'\s+Province$', '', province).strip()

        district = (address.get("county") or address.get("city_district")
                    or address.get("suburb") or "")
        # Clean up "District" suffix
        district = re.sub(r'\s+District$', '', district).strip()

        return {"province_en": province, "district_en": district}
    except Exception as e:
        print(f"  Nominatim error: {e}", file=sys.stderr)
        return {}


def reverse_geocode_th(lat: float, lng: float) -> dict:
    """Use Nominatim to get Thai names for province/district."""
    try:
        resp = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": lat,
                "lon": lng,
                "format": "json",
                "accept-language": "th",
                "zoom": 14,
            },
            headers={"User-Agent": "WelB-Spot-Scraper/1.0"},
            timeout=10,
        )
        data = resp.json()
        address = data.get("address", {})

        province_th = (address.get("state") or address.get("province")
                       or address.get("city") or "")
        # Clean common Thai prefixes for consistency
        province_th = re.sub(r'^จังหวัด', '', province_th).strip()

        district_th = (address.get("county") or address.get("city_district")
                       or address.get("suburb") or "")
        district_th = re.sub(r'^(อำเภอ|เขต)', '', district_th).strip()

        return {"province_th": province_th, "district_th": district_th}
    except Exception:
        return {}


# def generate_description(name: str, category: str, province: str) -> str:
#     """Use Claude Haiku to generate a short description."""
#     try:
#         response = ai_client.messages.create(
#             model="claude-haiku-4-5-20251001",
#             max_tokens=200,
#             temperature=0.3,
#             messages=[{
#                 "role": "user",
#                 "content": (
#                     f"Write a single sentence (max 20 words) describing this "
#                     f"Bitcoin-accepting business in Thailand:\n"
#                     f"Name: {name}\nCategory: {category}\nProvince: {province}\n"
#                     f"Reply with just the sentence, no quotes."
#                 ),
#             }],
#         )
#         return response.content[0].text.strip()
#     except Exception as e:
#         print(f"  AI description error: {e}", file=sys.stderr)
#         return f"Bitcoin-accepting {category} in {province}."


def upload_spot(spot: dict) -> dict:
    """Upload transformed spot to the API."""
    url = f"{API_BASE_URL}/api/update-spot"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    response = requests.post(url, json=spot, headers=headers)
    return response.json()


def build_payload(row: dict, coords: tuple, geo_en: dict, geo_th: dict, description: str) -> dict:
    """Build API payload from raw row + extracted data."""
    csv_category = row.get("category", "other").lower().strip()
    category_id = CATEGORY_ID_MAPPING.get(csv_category, "other-general")

    lat, lng = coords

    payload = {
        "name": row.get("name", "").strip(),
        "description": description,
        "type": "shop",
        "categoryId": category_id,
        "province": geo_en.get("province_en") or row.get("province", "Unknown"),
        "provinceTh": geo_th.get("province_th") or "",
        "googleMapLink": row.get("google_map_link", "").strip(),
    }

    district_en = geo_en.get("district_en")
    if district_en:
        payload["district"] = district_en
    district_th = geo_th.get("district_th")
    if district_th:
        payload["districtTh"] = district_th

    if lat is not None:
        payload["lat"] = lat
    if lng is not None:
        payload["lng"] = lng

    phone = row.get("phone", "").strip()
    if phone and phone != "n/a" and phone != "#ERROR!":
        payload["phone"] = phone

    contact_link = row.get("contact_link", "").strip()
    if contact_link and contact_link != "n/a":
        if "facebook.com" in contact_link:
            payload["facebookLink"] = contact_link
        elif not contact_link.startswith("mailto:"):
            payload["websiteLink"] = contact_link

    return payload


def main():
    if len(sys.argv) < 2:
        print("Usage: python transform_spot.py '<json_row>'", file=sys.stderr)
        sys.exit(1)

    row = json.loads(sys.argv[1])
    name = row.get("name", "unknown")

    print(f"  Transforming: {name}")

    # Step 1: Extract coords from Google Maps URL
    google_map_link = row.get("google_map_link", "")
    resolved_url = resolve_short_url(google_map_link)
    lat, lng = extract_coords_from_url(resolved_url)

    # Fallback to CSV coords if URL parsing failed
    if lat is None or lng is None:
        raw_lat = row.get("lat", "")
        raw_lng = row.get("lon", "")
        if raw_lat and raw_lat != "n/a":
            try:
                csv_lat, csv_lng = float(raw_lat), float(raw_lng)
                if is_valid_thailand_coord(csv_lat, csv_lng):
                    lat, lng = csv_lat, csv_lng
            except (ValueError, TypeError):
                pass

    print(f"  Coords: lat={lat}, lng={lng} (from {'URL' if lat else 'none'})")

    # Step 2: Reverse geocode to get province/district
    geo_en = {}
    geo_th = {}
    if lat is not None and lng is not None:
        geo_en = reverse_geocode(lat, lng)
        time.sleep(1)  # Nominatim rate limit: 1 req/sec
        geo_th = reverse_geocode_th(lat, lng)
        time.sleep(1)
        print(f"  Geo: province={geo_en.get('province_en')}, district={geo_en.get('district_en')}")

    # Step 3: Generate description with AI
    csv_category = row.get("category", "other")
    province = geo_en.get("province_en") or row.get("province", "Unknown")
    description = generate_description(name, csv_category, province)

    # Step 4: Build payload and upload
    payload = build_payload(row, (lat, lng), geo_en, geo_th, description)

    result = upload_spot(payload)

    if result.get("success"):
        action = result.get("action", "unknown")
        print(f"  OK ({action}): {payload['name']}")
    else:
        error = result.get("error", "Unknown error")
        print(f"  FAIL: {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spot Scraper - Reads data from Google Sheets CSV and uploads to WelB API
"""

import csv
import json
import re
import requests
import os
import sys
import time
from io import StringIO
from typing import Optional
from pathlib import Path

# Ensure stdout can handle UTF-8 (for Thai characters)
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from dataclasses import dataclass

PROGRESS_FILE = str(Path(__file__).parent / ".spot_progress")

# Load province.json for Thai -> English mapping
PROVINCE_JSON_PATH = Path(__file__).parent.parent / "src" / "lib" / "const" / "province.json"
with open(PROVINCE_JSON_PATH, "r", encoding="utf-8") as f:
    PROVINCES = json.load(f)

# Build Thai -> English province lookup
PROVINCE_TH_TO_EN = {p["name_th"]: p["name_en"] for p in PROVINCES}

# Configuration
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7UWrVDmXzeG8UHvLU6NAuGucC9GPMy5CRQTzl4pX_BqqRTXnKcczWu78U0oO8dpUR06H5-a_dnHIM/pub?output=csv"
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")
API_KEY = os.getenv("SCRAPER_API_KEY", "your-api-key-here")

print("API_BASE_URL", API_BASE_URL)
print("API_KEY", API_KEY)

# CSV category to app category/subCategory mapping
CATEGORY_MAPPING = {
    # Food & Beverage
    "cafe": ("food", "cafe"),
    "restaurant": ("food", "restaurant"),
    "bar": ("food", "bar"),
    "bakery": ("food", "bakery"),
    "confectionery": ("food", "bakery"),
    "fast_food": ("food", "restaurant"),
    "food_court": ("food", "restaurant"),
    "ice_cream": ("food", "cafe"),
    "beverages": ("food", "cafe"),
    "deli": ("food", "restaurant"),
    "seafood": ("food", "restaurant"),
    "butcher": ("food", "restaurant"),
    
    # Accommodation
    "hotel": ("accommodation", "hotel"),
    "hostel": ("accommodation", "hostel"),
    "resort": ("accommodation", "resort"),
    "guesthouse": ("accommodation", "hostel"),
    "apartment": ("accommodation", "hotel"),
    
    # Shopping
    "electronics": ("shopping", "electronics"),
    "clothing": ("shopping", "fashion"),
    "grocery": ("shopping", "grocery"),
    "supermarket": ("shopping", "grocery"),
    "convenience": ("shopping", "grocery"),
    "general_store": ("shopping", "grocery"),
    "marketplace": ("shopping", "retail"),
    "second_hand": ("shopping", "retail"),
    "jewelry": ("shopping", "retail"),
    "kiosk": ("shopping", "retail"),
    "furniture": ("shopping", "retail"),
    "hardware": ("shopping", "retail"),
    "leather": ("shopping", "fashion"),
    
    # Services
    "hairdresser": ("services", "barber"),
    "beauty": ("services", "salon"),
    "laundry": ("services", "laundry"),
    "repair": ("services", "repair"),
    "tailor": ("services", "salon"),
    "optician": ("services", "repair"),
    "camera": ("services", "repair"),
    "copyshop": ("services", "repair"),
    "clockmaker": ("services", "repair"),
    "shipping": ("services", "repair"),
    "insurance": ("services", "repair"),
    "car_wash": ("services", "repair"),
    "vehicle_inspection": ("services", "repair"),
    
    # Health & Wellness
    "pharmacy": ("health", "pharmacy"),
    "clinic": ("health", "clinic"),
    "dentist": ("health", "clinic"),
    "gym": ("health", "gym"),
    "massage": ("health", "spa"),
    "spa": ("health", "spa"),
    "counselling": ("health", "clinic"),
    "physiotherapy": ("health", "clinic"),
    "veterinary": ("health", "clinic"),
    "herbalist": ("health", "pharmacy"),
    "alternative_medicine": ("health", "clinic"),
    
    # Entertainment
    "arcade": ("entertainment", "gaming"),
    "theme_park": ("entertainment", "gaming"),
    "gallery": ("entertainment", "cinema"),
    "studio": ("entertainment", "cinema"),
    
    # Transportation
    "motorcycle_rental": ("transport", "bike"),
    "taxi": ("transport", "taxi"),
    "guide": ("transport", "taxi"),
    
    # Community
    "coworking": ("community", "coworking"),
    "training": ("community", "education"),
    "school": ("community", "education"),
    "community_centre": ("community", "community-space"),
    "hackerspace": ("community", "coworking"),
    "place_of_worship": ("community", "community-space"),
    
    # Other
    "cannabis": ("other", "cannabis"),
    "pet": ("other", "pet"),
    "tattoo": ("other", "art"),
    "garden": ("other", "general"),
    "farm": ("other", "general"),
    "real_estate": ("other", "general"),
    "consulting": ("other", "general"),
    "lawyer": ("other", "general"),
    "exchange": ("other", "general"),
    "lottery": ("other", "general"),
    "brewery": ("other", "general"),
    "campsite": ("other", "general"),
    "parking": ("other", "general"),
    "other": ("other", "general"),
    "online": ("other", "general"),
}
    
REGION_DISTRICT_MAPPING = {
    "Huai Phueng": "Huai Phueng",
    "Hat Yai": "Hat Yai",
}

REGION_MAPPING = {
    # Cities
    "Bangkok": "Bangkok",
    "Chiang Mai": "Chiang Mai",
    "Phuket": "Phuket",
    "Hat Yai": "Hat Yai",
    "Yala": "Yala",
    # Macro regions - Northern
    "Chiang Rai": "Northern",
    "Lampang": "Northern",
    "Lamphun": "Northern",
    "Mae Hong Son": "Northern",
    "Nan": "Northern",
    "Phayao": "Northern",
    "Phrae": "Northern",
    "Uttaradit": "Northern",
    "Sukhothai": "Northern",
    "Tak": "Northern",
    "Kamphaeng Phet": "Northern",
    "Phitsanulok": "Northern",
    "Phichit": "Northern",
    "Phetchabun": "Northern",
    # Macro regions - Northeastern (Isan)
    "Nakhon Ratchasima": "Northeastern",
    "Khon Kaen": "Northeastern",
    "Udon Thani": "Northeastern",
    "Ubon Ratchathani": "Northeastern",
    "Kalasin": "Northeastern",
    "Chaiyaphum": "Northeastern",
    "Buri Ram": "Northeastern",
    "Surin": "Northeastern",
    "Sisaket": "Northeastern",
    "Roi Et": "Northeastern",
    "Maha Sarakham": "Northeastern",
    "Loei": "Northeastern",
    "Nong Khai": "Northeastern",
    "Nong Bua Lamphu": "Northeastern",
    "Sakon Nakhon": "Northeastern",
    "Nakhon Phanom": "Northeastern",
    "Mukdahan": "Northeastern",
    "Yasothon": "Northeastern",
    "Amnat Charoen": "Northeastern",
    "Bueng Kan": "Northeastern",
    # Macro regions - Central
    "Nonthaburi": "Central",
    "Pathum Thani": "Central",
    "Samut Prakan": "Central",
    "Samut Sakhon": "Central",
    "Samut Songkhram": "Central",
    "Nakhon Pathom": "Central",
    "Ayutthaya": "Central",
    "Ang Thong": "Central",
    "Lopburi": "Central",
    "Sing Buri": "Central",
    "Chainat": "Central",
    "Saraburi": "Central",
    "Nakhon Nayok": "Central",
    "Suphan Buri": "Central",
    "Nakhon Sawan": "Central",
    "Uthai Thani": "Central",
    # Macro regions - Eastern
    "Chon Buri": "Eastern",
    "Rayong": "Eastern",
    "Chanthaburi": "Eastern",
    "Trat": "Eastern",
    "Prachinburi": "Eastern",
    "Sa Kaeo": "Eastern",
    # Macro regions - Western
    "Kanchanaburi": "Western",
    "Ratchaburi": "Western",
    "Phetchaburi": "Western",
    "Prachuap Khiri Khan": "Western",
    # Macro regions - Southern
    "Chumphon": "Southern",
    "Ranong": "Southern",
    "Surat Thani": "Southern",
    "Nakhon Si Thammarat": "Southern",
    "Phatthalung": "Southern",
    "Songkhla": "Southern",
    "Satun": "Southern",
    "Trang": "Southern",
    "Pattani": "Southern",
    "Narathiwat": "Southern",
    "Krabi": "Southern",
    "Phang Nga": "Southern",
}


@dataclass
class SpotData:
    name: str
    description: str
    type: str
    category: str
    sub_category: str
    province: str
    province_th: str
    region: str
    google_map_link: str
    district: Optional[str] = None
    district_th: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    phone: Optional[str] = None
    facebook_link: Optional[str] = None
    website_link: Optional[str] = None


def map_province(province_th: str) -> tuple[str, str]:
    """Map Thai province name to English and find region.
    Returns (province_en, region)."""
    # Clean Thai prefix
    cleaned = re.sub(r'^จังหวัด', '', province_th).strip()

    province_en = PROVINCE_TH_TO_EN.get(cleaned, "")

    if not province_en:
        # Try original too
        province_en = PROVINCE_TH_TO_EN.get(province_th, "")

    if not province_en:
        return province_th, "Unknown"

    region = REGION_MAPPING.get(province_en, "Unknown")
    return province_en, region


def get_category_mapping(csv_category: str) -> tuple[str, str]:
    """Map CSV category to app category and subCategory"""
    csv_category = csv_category.lower().strip()
    return CATEGORY_MAPPING.get(csv_category, ("other", "general"))


def parse_contact_link(contact_link: str) -> tuple[Optional[str], Optional[str]]:
    """Parse contact link to determine if it's Facebook or website"""
    if not contact_link or contact_link == "n/a":
        return None, None
    
    contact_link = contact_link.strip()
    
    if "facebook.com" in contact_link:
        return contact_link, None
    elif "instagram.com" in contact_link:
        return None, contact_link
    elif contact_link.startswith("mailto:"):
        return None, None
    else:
        return None, contact_link


def parse_phone(phone: str) -> Optional[str]:
    """Clean phone number"""
    if not phone or phone == "n/a" or phone == "#ERROR!":
        return None
    return phone.strip()


def parse_coordinate(coord: str) -> Optional[float]:
    """Parse coordinate string to float"""
    if not coord or coord == "n/a":
        return None
    try:
        return float(coord.strip())
    except ValueError:
        return None


def fetch_csv_data() -> list[dict]:
    """Fetch CSV data from Google Sheets"""
    print(f"Fetching CSV from: {CSV_URL}")
    response = requests.get(CSV_URL)
    response.raise_for_status()
    
    # Ensure UTF-8 encoding for Thai characters
    response.encoding = 'utf-8'
    
    # Parse CSV
    csv_content = StringIO(response.text)
    reader = csv.DictReader(csv_content)
    
    rows = list(reader)
    print(f"Found {len(rows)} rows in CSV")
    return rows


def row_to_spot(row: dict) -> Optional[SpotData]:
    """Convert CSV row to SpotData"""
    name = row.get("name", "").strip()
    province_raw = row.get("province", "").strip()  # Thai from CSV
    csv_category = row.get("category", "other").strip()
    google_map_link = row.get("google_map_link", "").strip()

    # Skip rows without required data
    if not name or name == "n/a":
        return None
    if not google_map_link:
        return None

    category, sub_category = get_category_mapping(csv_category)

    # Map Thai province to English and find region
    province_en, region = map_province(province_raw)
    province_th = province_raw

    facebook_link, website_link = parse_contact_link(row.get("contact_link", ""))

    # Create description from available data
    opening_hours = row.get("opening_hours", "").strip()
    description = f"Bitcoin-accepting {csv_category}"
    if opening_hours and opening_hours != "n/a":
        description += f". Hours: {opening_hours}"

    return SpotData(
        name=name,
        description=description,
        type="shop",
        category=category,
        sub_category=sub_category,
        province=province_en,
        province_th=province_th,
        region=region,
        google_map_link=google_map_link,
        lat=parse_coordinate(row.get("lat", "")),
        lng=parse_coordinate(row.get("lon", "")),
        phone=parse_phone(row.get("phone", "")),
        facebook_link=facebook_link,
        website_link=website_link,
    )


def upload_spot(spot: SpotData) -> dict:
    """Upload spot to API"""
    url = f"{API_BASE_URL}/api/create-spot"
    
    payload = {
        "name": spot.name,
        "description": spot.description,
        "type": spot.type,
        "category": f"{spot.category}-{spot.sub_category}",
        "region": spot.region,
        "province": spot.province,
        "provinceTh": spot.province_th,
        "googleMapLink": spot.google_map_link,
    }
    
    # Optional fields
    if spot.district:
        payload["district"] = spot.district
    if spot.district_th:
        payload["districtTh"] = spot.district_th
    if spot.lat is not None:
        payload["lat"] = spot.lat
    if spot.lng is not None:
        payload["lng"] = spot.lng
    if spot.phone:
        payload["phone"] = spot.phone
    if spot.facebook_link:
        payload["facebookLink"] = spot.facebook_link
    if spot.website_link:
        payload["websiteLink"] = spot.website_link
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()


# Thailand bounding box for sanity checking coordinates
THAILAND_LAT_MIN, THAILAND_LAT_MAX = 5.5, 20.5
THAILAND_LNG_MIN, THAILAND_LNG_MAX = 97.0, 106.0


def is_valid_thailand_coord(lat: float, lng: float) -> bool:
    return (THAILAND_LAT_MIN <= lat <= THAILAND_LAT_MAX and
            THAILAND_LNG_MIN <= lng <= THAILAND_LNG_MAX)


def extract_coords_from_url(url: str) -> tuple[float | None, float | None]:
    """Extract lat/lng from Google Maps URL patterns."""
    for pattern in [
        r'@(-?\d+\.\d+),(-?\d+\.\d+)',
        r'[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)',
        r'/(?:dir|place)/[^/]*?(-?\d+\.\d+),(-?\d+\.\d+)',
    ]:
        m = re.search(pattern, url)
        if m:
            lat, lng = float(m.group(1)), float(m.group(2))
            if is_valid_thailand_coord(lat, lng):
                return lat, lng

    # !3dlat!4dlng format
    m_lat = re.search(r'!3d(-?\d+\.\d+)', url)
    m_lng = re.search(r'!4d(-?\d+\.\d+)', url)
    if m_lat and m_lng:
        lat, lng = float(m_lat.group(1)), float(m_lng.group(1))
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


def reverse_geocode(lat: float, lng: float, lang: str = "en") -> dict:
    """Use Nominatim to reverse geocode coordinates."""
    try:
        resp = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lng, "format": "json",
                    "accept-language": lang, "zoom": 14},
            headers={"User-Agent": "WelB-Spot-Scraper/1.0"},
            timeout=10,
        )
        data = resp.json()
        address = data.get("address", {})

        province = (address.get("state") or address.get("province")
                    or address.get("city") or "")
        district = (address.get("county") or address.get("city_district")
                    or address.get("suburb") or "")

        if lang == "en":
            province = re.sub(r'\s+Province$', '', province).strip()
            district = re.sub(r'\s+District$', '', district).strip()
        elif lang == "th":
            province = re.sub(r'^จังหวัด', '', province).strip()
            district = re.sub(r'^(อำเภอ|เขต)', '', district).strip()

        return {"province": province, "district": district}
    except Exception as e:
        print(f"  Nominatim error: {e}", file=sys.stderr)
        return {}


def process_row_with_ai(row: dict, index: int, total: int) -> bool:
    """Process a single CSV row: parse coords, geocode, upload."""
    spot = row_to_spot(row)
    if spot is None:
        return None  # skip

    print(f"\n[{index}/{total}] Processing: {spot.name}")
    print(f"  Province: {spot.province} (TH: {spot.province_th}), Region: {spot.region}")

    # Step 1: Extract coords from Google Maps URL
    resolved_url = resolve_short_url(spot.google_map_link)
    lat, lng = extract_coords_from_url(resolved_url)

    # Fallback to CSV coords
    if lat is None and spot.lat is not None and spot.lng is not None:
        if is_valid_thailand_coord(spot.lat, spot.lng):
            lat, lng = spot.lat, spot.lng

    if lat is not None:
        spot.lat = lat
        spot.lng = lng
        print(f"  Coords: lat={lat}, lng={lng}")

        # Step 2: Reverse geocode for district
        geo_en = reverse_geocode(lat, lng, "en")
        time.sleep(1)
        geo_th = reverse_geocode(lat, lng, "th")
        time.sleep(1)

        district_en = geo_en.get("district", "")
        if district_en:
            spot.district = district_en
        district_th = geo_th.get("district", "")
        if district_th:
            spot.district_th = district_th

        # Check district-level region override
        if district_en and district_en in REGION_DISTRICT_MAPPING:
            spot.region = REGION_DISTRICT_MAPPING[district_en]
            print(f"  Region override (district): {spot.region}")

        print(f"  District: {district_en} (TH: {district_th})")
    else:
        print(f"  No coords found")

    # Step 3: Upload
    result = upload_spot(spot)

    if result.get("success"):
        action = result.get("action", "unknown")
        print(f"  OK ({action}): {spot.name}")
        return True
    else:
        error = result.get("error", "Unknown error")
        print(f"  FAIL: {error}", file=sys.stderr)
        return False


def load_progress() -> int:
    """Load last successfully processed row index from progress file."""
    try:
        with open(PROGRESS_FILE, "r") as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0


def save_progress(index: int):
    """Save last successfully processed row index."""
    with open(PROGRESS_FILE, "w") as f:
        f.write(str(index))


def clear_progress():
    """Remove progress file."""
    try:
        os.remove(PROGRESS_FILE)
    except FileNotFoundError:
        pass


def main():
    """Main function - reads CSV and dispatches each row to transform_spot.py

    Usage:
        python spot.py              # start fresh (resets progress)
        python spot.py --continue   # resume from last successful row
    """
    continue_mode = "--continue" in sys.argv

    print("=" * 60)
    print("WelB Spot Scraper (AI mode)")
    print("=" * 60)

    # Fetch CSV data
    rows = fetch_csv_data()

    # Determine start index
    start_index = 0
    if continue_mode:
        start_index = load_progress()
        if start_index > 0:
            print(f"Resuming from row {start_index + 1} (skipping {start_index} already processed)")
    else:
        clear_progress()

    # Process each row via subprocess
    success_count = 0
    error_count = 0
    skip_count = 0

    for i, row in enumerate(rows):
        if i < start_index:
            continue

        result = process_row_with_ai(row, i + 1, len(rows))

        if result is None:
            skip_count += 1
            save_progress(i + 1)
        elif result:
            success_count += 1
            save_progress(i + 1)
        else:
            error_count += 1
            print(f"\nStopped at row {i + 1}. Run with --continue to resume.")
            break

    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total rows:    {len(rows)}")
    print(f"Started from:  {start_index + 1}")
    print(f"Successful:    {success_count}")
    print(f"Errors:        {error_count}")
    print(f"Skipped:       {skip_count}")

    if success_count + skip_count + start_index >= len(rows):
        print("\nAll rows processed! Clearing progress file.")
        clear_progress()


if __name__ == "__main__":
    main()

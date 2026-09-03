import math
from typing import List, Dict, Any, Optional

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def detect_anomalies(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    # Group debit transactions by location address or merchant
    location_groups: Dict[str, List[Dict[str, Any]]] = {}
    for t in transactions:
        if t.get("type") == "debit" and t.get("location"):
            loc_key = t["location"].get("address", t.get("merchant", "Unknown"))
            if loc_key not in location_groups:
                location_groups[loc_key] = []
            location_groups[loc_key].append(t)

    anomalies = []
    for loc, txns in location_groups.items():
        amounts = [t["amount"] for t in txns]
        if len(amounts) < 2:
            continue
        amounts_sorted = sorted(amounts)
        n = len(amounts_sorted)
        q1 = amounts_sorted[n // 4]
        q3 = amounts_sorted[(3 * n) // 4]
        iqr = q3 - q1
        upper_bound = q3 + 1.5 * iqr

        for t in txns:
            if t["amount"] > upper_bound and t["amount"] > 1000:
                anomalies.append({
                    "transactionId": t.get("id"),
                    "merchant": t.get("merchant"),
                    "amount": t["amount"],
                    "location": loc,
                    "threshold": round(upper_bound, 2),
                    "reason": f"₹{t['amount']:,} is unusually high compared with your normal spending at {loc} (normal upper limit ~₹{round(upper_bound):,})."
                })

    return anomalies

def find_hotspots(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    location_summary: Dict[str, Dict[str, Any]] = {}
    for t in transactions:
        if t.get("type") == "debit" and t.get("location"):
            loc = t["location"].get("address", "Unknown")
            if loc not in location_summary:
                location_summary[loc] = {
                    "location": loc,
                    "totalAmount": 0.0,
                    "count": 0,
                    "lat": t["location"].get("lat"),
                    "lng": t["location"].get("lng"),
                    "categories": {}
                }
            location_summary[loc]["totalAmount"] += t["amount"]
            location_summary[loc]["count"] += 1
            cat = t.get("category", "Other")
            location_summary[loc]["categories"][cat] = location_summary[loc]["categories"].get(cat, 0) + t["amount"]

    hotspots = []
    for loc, data in location_summary.items():
        dominant_cat = max(data["categories"].items(), key=lambda x: x[1])[0] if data["categories"] else "General"
        hotspots.append({
            "location": loc,
            "totalAmount": round(data["totalAmount"], 2),
            "count": data["count"],
            "lat": data["lat"],
            "lng": data["lng"],
            "dominantCategory": dominant_cat
        })

    hotspots.sort(key=lambda x: x["totalAmount"], reverse=True)
    return hotspots[:5]

def generate_insights(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    valid_txns = [t for t in transactions if t.get("type") == "debit"]
    if not valid_txns:
        return []

    insights = []
    # Highest spending location
    hotspots = find_hotspots(valid_txns)
    if hotspots:
        top = hotspots[0]
        insights.append({
            "id": "top_loc",
            "type": "warning",
            "title": "Highest Spending Hub",
            "message": f"Your highest spending location is {top['location']} with ₹{top['totalAmount']:,} total across {top['count']} visits."
        })

    # Category insight
    cat_spending: Dict[str, float] = {}
    for t in valid_txns:
        c = t.get("category", "Other")
        cat_spending[c] = cat_spending.get(c, 0.0) + t["amount"]
    if cat_spending:
        top_cat = max(cat_spending.items(), key=lambda x: x[1])
        insights.append({
            "id": "top_cat",
            "type": "info",
            "title": "Dominant Category",
            "message": f"{top_cat[0]} accounts for the highest spatial spending at ₹{round(top_cat[1]):,}."
        })

    # Savings suggestion
    total_spent = sum(t["amount"] for t in valid_txns)
    potential_savings = round(total_spent * 0.12, 2)
    insights.append({
        "id": "savings",
        "type": "success",
        "title": "Potential Savings Opportunity",
        "message": f"Reducing top location dining & impulsiveness by 15% could save you approx ₹{potential_savings:,} monthly."
    })

    return insights

def compute_geo_summary(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    debit_txns = [t for t in transactions if t.get("type") == "debit"]
    with_loc = [t for t in debit_txns if t.get("location") and t["location"].get("lat") and t["location"].get("lng")]
    missing_loc_count = len(debit_txns) - len(with_loc)

    total_spending = sum(t["amount"] for t in debit_txns)
    avg_txn = total_spending / len(debit_txns) if debit_txns else 0.0

    hotspots = find_hotspots(debit_txns)
    top_location = hotspots[0]["location"] if hotspots else "N/A"
    
    cat_totals: Dict[str, float] = {}
    for t in debit_txns:
        c = t.get("category", "Other")
        cat_totals[c] = cat_totals.get(c, 0.0) + t["amount"]
    top_category = max(cat_totals.items(), key=lambda x: x[1])[0] if cat_totals else "N/A"

    anomalies = detect_anomalies(debit_txns)
    insights = generate_insights(debit_txns)

    return {
        "totalSpending": round(total_spending, 2),
        "transactionCount": len(debit_txns),
        "validGeoCount": len(with_loc),
        "missingLocationCount": missing_loc_count,
        "averageTransaction": round(avg_txn, 2),
        "topSpendingLocation": top_location,
        "topCategory": top_category,
        "topLocations": hotspots,
        "anomalies": anomalies,
        "insights": insights
    }

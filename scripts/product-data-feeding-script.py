import requests
import json

api_endpoint = "http://localhost:5000/api/v1/products"
content_type = "application/json"
jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTM2MzcyMDRjNjk3NzVjMTQ0YTYzMyIsImlhdCI6MTczMzUxODM3MywiZXhwIjoxNzMzNjA0NzczfQ.4EiVC75mKrB8AyQH2_BkW7EKRal0EvJUPGvrXh2THKA"

def load_data(filename):
    """Load data from a JSON file"""
    with open(f'json/{filename}', 'r') as file:
        return json.load(file)

def post_products(items, category):
    """Post products to API and track results"""
    # API endpoint
    url = api_endpoint
    
    # Headers with JWT token
    headers = {
        'Content-Type': content_type,
        'Authorization': f'Bearer {jwt}'
    }

    results = []
    
    print(f"\nProcessing {category}...")
    print("-" * 50)
    
    for item in items:
        try:
            response = requests.post(url, json=item, headers=headers)
            status = "✅ Success" if response.status_code == 201 else f"❌ Failed ({response.status_code})"
            results.append(f"{status}: {item['name']}")
            print(f"{status}: {item['name']}")
            
        except Exception as e:
            error_msg = f"❌ Error for {item['name']}: {str(e)}"
            results.append(error_msg)
            print(error_msg)
    
    return results

def main():
    # Data sources configuration
    sources = [
        {"file": "prescribed-medicines.json", "category": "Prescribed Medicines"},
        {"file": "otc-medicines.json", "category": "OTC Medicines"},
        {"file": "supplements.json", "category": "Supplements"},
        {"file": "healthcare-supplies.json", "category": "Healthcare Supplies"}
    ]
    
    all_results = []
    
    print("Starting product upload process...")
    print("=" * 50)
    
    # Process each data source
    for source in sources:
        try:
            # Load data
            print(f"\nLoading {source['category']} data...")
            items = load_data(source['file'])
            
            # Post products and collect results
            results = post_products(items, source['category'])
            all_results.extend(results)
            
            print(f"\nCompleted {source['category']}: {len(items)} items processed")
            print("=" * 50)
            
        except Exception as e:
            print(f"\n❌ Error processing {source['category']}: {str(e)}")
            print("=" * 50)
    
    # Print summary
    print("\nFinal Summary")
    print("=" * 50)
    successes = sum(1 for result in all_results if "✅ Success" in result)
    failures = len(all_results) - successes
    print(f"Total items processed: {len(all_results)}")
    print(f"Successful uploads: {successes}")
    print(f"Failed uploads: {failures}")

if __name__ == "__main__":
    main()
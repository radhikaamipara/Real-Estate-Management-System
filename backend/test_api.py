import json
from app import create_app
from extensions import db

app = create_app()
client = app.test_client()

def test_system():
    print("--- 1. Testing Health Check ---")
    res = client.get('/api/health')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("Health check OK:", res.get_json())

    print("\n--- 2. Testing Public Properties Search ---")
    res = client.get('/api/properties?city=Ahmedabad')
    assert res.status_code == 200
    data = res.get_json()
    print(f"Found {len(data['properties'])} properties in Ahmedabad (Total: {data['pagination']['total']})")

    print("\n--- 3. Testing Featured Properties ---")
    res = client.get('/api/properties/featured?limit=4')
    assert res.status_code == 200
    featured = res.get_json()['properties']
    print(f"Featured properties count: {len(featured)}")

    print("\n--- 4. Testing Buyer Login & Profile ---")
    res = client.post('/api/auth/login', json={'email': 'amit.shah@gmail.com', 'password': 'Buyer@123'})
    assert res.status_code == 200
    buyer_token = res.get_json()['access_token']
    buyer_headers = {'Authorization': f'Bearer {buyer_token}'}
    
    # Test Buyer Profile
    res = client.get('/api/auth/me', headers=buyer_headers)
    assert res.status_code == 200
    print("Buyer profile OK:", res.get_json()['user']['full_name'])

    # Test Buyer Favorites
    res = client.get('/api/favorites', headers=buyer_headers)
    assert res.status_code == 200
    print(f"Buyer favorites count: {len(res.get_json()['favorites'])}")

    # Test Buyer Inquiries
    res = client.get('/api/inquiries/buyer', headers=buyer_headers)
    assert res.status_code == 200
    print(f"Buyer inquiries count: {len(res.get_json()['inquiries'])}")

    print("\n--- 5. Testing Agent Login & Dashboard Endpoints ---")
    res = client.post('/api/auth/login', json={'email': 'rajesh.patel@gujaratproperties.com', 'password': 'Agent@123'})
    assert res.status_code == 200
    agent_token = res.get_json()['access_token']
    agent_headers = {'Authorization': f'Bearer {agent_token}'}

    res = client.get('/api/properties/agent/my-listings', headers=agent_headers)
    assert res.status_code == 200
    print(f"Agent listings count: {len(res.get_json()['properties'])}")

    res = client.get('/api/inquiries/agent', headers=agent_headers)
    assert res.status_code == 200
    print(f"Agent received inquiries: {len(res.get_json()['inquiries'])}")

    print("\n--- 6. Testing Admin Login & Dashboard ---")
    res = client.post('/api/auth/login', json={'email': 'admin@realestate.com', 'password': 'Admin@123'})
    assert res.status_code == 200
    admin_token = res.get_json()['access_token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}

    res = client.get('/api/admin/dashboard', headers=admin_headers)
    assert res.status_code == 200
    stats = res.get_json()['stats']
    print("Admin dashboard stats OK:", stats)

    res = client.get('/api/admin/reports', headers=admin_headers)
    assert res.status_code == 200
    reports = res.get_json()['reports']
    print("Admin reports breakdown OK. Cities:", [c['city'] for c in reports['properties_by_city']])

    print("\nAll Backend Test Assertions Passed Successfully!")

if __name__ == '__main__':
    test_system()

import requests
import json

def test_api():
    """Test the backend API with a sample image"""
    url = "http://localhost:5000/predict"
    
    # Create a dummy test file (this would normally be an actual image)
    test_data = {
        'image': ('test.jpg', b'fake_image_data', 'image/jpeg')
    }
    
    try:
        print("Testing backend API...")
        response = requests.post(url, files=test_data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API responded successfully!")
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ API returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend API")
        print("Make sure the Flask server is running on localhost:5000")
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_api()

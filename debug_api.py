import requests
import os

def test_simple_api():
    """Simple test to check if API is working"""
    
    # Test with the sample fundus image
    image_path = "c:/Users/vallu/Downloads/glaucoma-vision-demo-main/glaucoma-vision-demo-main/REFUGE_sample/training/glaucoma/sample_glaucoma.jpg"
    
    if not os.path.exists(image_path):
        print("❌ Sample image not found")
        return
    
    print("🔍 Testing API with sample fundus image...")
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': ('test.jpg', f.read(), 'image/jpeg')}
            response = requests.post('http://localhost:5000/predict', files=files, timeout=60)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API Response:")
                print(f"   Validation: {result.get('validation')}")
                print(f"   Error: {result.get('error')}")
                print(f"   Prediction: {result.get('prediction')}")
                print(f"   CDR: {result.get('cdr')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_simple_api()

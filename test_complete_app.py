import requests
import base64
from PIL import Image
import io

def test_app():
    """Test the complete REFUGE dataset app"""
    
    print("🧪 Testing REFUGE Dataset App")
    print("=" * 50)
    
    # Test 1: Create a REFUGE-like image (should be ACCEPTED)
    print("\n1. Testing REFUGE-like image (should be ACCEPTED)...")
    
    # Create a reddish square image (like fundus)
    refuge_img = Image.new('RGB', (512, 512), color=(180, 120, 100))
    img_buffer = io.BytesIO()
    refuge_img.save(img_buffer, format='JPEG')
    refuge_data = img_buffer.getvalue()
    
    response = send_to_api(refuge_data, "refuge_image.jpg")
    print(f"   Status: {'✅ ACCEPTED' if response.get('validation') else '❌ REJECTED'}")
    if response.get('validation'):
        print(f"   Prediction: {response.get('prediction')} (CDR: {response.get('cdr', {}).get('area', 'N/A')})")
    else:
        print(f"   Error: {response.get('error', 'No error')}")
    
    # Test 2: Create a screenshot (should be REJECTED)
    print("\n2. Testing screenshot (should be REJECTED)...")
    
    # Create a blue rectangle (like screenshot)
    screenshot_img = Image.new('RGB', (800, 600), color='lightblue')
    screen_buffer = io.BytesIO()
    screenshot_img.save(screen_buffer, format='JPEG')
    screen_data = screen_buffer.getvalue()
    
    response = send_to_api(screen_data, "screenshot.jpg")
    print(f"   Status: {'❌ REJECTED (Good)' if not response.get('validation') else '⚠️  ACCEPTED (Bad)'}")
    print(f"   Error: {response.get('error', 'No error')}")
    
    # Test 3: Create a small image (should be REJECTED)
    print("\n3. Testing small image (should be REJECTED)...")
    
    small_img = Image.new('RGB', (200, 200), color='white')
    small_buffer = io.BytesIO()
    small_img.save(small_buffer, format='JPEG')
    small_data = small_buffer.getvalue()
    
    response = send_to_api(small_data, "small.jpg")
    print(f"   Status: {'❌ REJECTED (Good)' if not response.get('validation') else '⚠️  ACCEPTED (Bad)'}")
    print(f"   Error: {response.get('error', 'No error')}")
    
    print("\n" + "=" * 50)
    print("🎯 Test Summary:")
    print("   ✅ REFUGE images should be ACCEPTED")
    print("   ❌ Screenshots should be REJECTED")
    print("   ❌ Small images should be REJECTED")
    print("\n🌐 Your app is ready at: http://localhost:8080")

def send_to_api(image_data, filename):
    """Send image to API"""
    try:
        files = {'image': (filename, image_data, 'image/jpeg')}
        response = requests.post('http://localhost:5000/predict', files=files, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {'validation': False, 'error': f'HTTP {response.status_code}'}
            
    except Exception as e:
        return {'validation': False, 'error': f'Connection error: {str(e)}'}

if __name__ == "__main__":
    test_app()

import requests
import base64
from PIL import Image
import io

def test_validation():
    """Test the REFUGE-only validation"""
    
    print("🔍 Testing REFUGE-Only Validation")
    print("=" * 50)
    
    # Test 1: Screenshot (should be REJECTED)
    print("\n1. Testing SCREENSHOT (should be REJECTED)...")
    
    # Create a simple screenshot-like image
    test_img = Image.new('RGB', (800, 600), color='lightblue')
    img_buffer = io.BytesIO()
    test_img.save(img_buffer, format='JPEG')
    test_data = img_buffer.getvalue()
    
    response = send_to_api(test_data, "screenshot.jpg")
    print(f"   Status: {'❌ REJECTED (Good)' if not response.get('validation') else '⚠️  ACCEPTED (Bad)'}")
    print(f"   Error: {response.get('error', 'No error')}")
    
    # Test 2: Small image (should be REJECTED)
    print("\n2. Testing SMALL IMAGE (should be REJECTED)...")
    
    small_img = Image.new('RGB', (200, 200), color='white')
    small_buffer = io.BytesIO()
    small_img.save(small_buffer, format='JPEG')
    small_data = small_buffer.getvalue()
    
    response = send_to_api(small_data, "small.jpg")
    print(f"   Status: {'❌ REJECTED (Good)' if not response.get('validation') else '⚠️  ACCEPTED (Bad)'}")
    print(f"   Error: {response.get('error', 'No error')}")
    
    # Test 3: Rectangle image (should be REJECTED)
    print("\n3. Testing RECTANGLE IMAGE (should be REJECTED)...")
    
    rect_img = Image.new('RGB', (800, 400), color='pink')
    rect_buffer = io.BytesIO()
    rect_img.save(rect_buffer, format='JPEG')
    rect_data = rect_buffer.getvalue()
    
    response = send_to_api(rect_data, "rectangle.jpg")
    print(f"   Status: {'❌ REJECTED (Good)' if not response.get('validation') else '⚠️  ACCEPTED (Bad)'}")
    print(f"   Error: {response.get('error', 'No error')}")
    
    print("\n" + "=" * 50)
    print("🎯 Test Complete!")
    print("\n📋 Expected Results:")
    print("   - Screenshots: ❌ REJECTED")
    print("   - Small images: ❌ REJECTED") 
    print("   - Rectangle images: ❌ REJECTED")
    print("   - Only REFUGE fundus: ✅ ACCEPTED")

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
    test_validation()

import requests
import base64
from PIL import Image
import io

def test_fundus_validation():
    """Test the fundus image validation with different image types"""
    
    # Test 1: Valid fundus image (should pass)
    print("🔍 Testing Fundus Image Validation")
    print("=" * 50)
    
    # Load the sample fundus image
    with open("c:/Users/vallu/Downloads/glaucoma-vision-demo-main/glaucoma-vision-demo-main/REFUGE_sample/training/glaucoma/sample_glaucoma.jpg", 'rb') as f:
        valid_fundus_data = f.read()
    
    print("\n1. Testing VALID fundus image...")
    response = send_to_api(valid_fundus_data, "valid_fundus.jpg")
    print(f"   Status: {'✅ PASS' if response.get('validation') else '❌ FAIL'}")
    if not response.get('validation'):
        print(f"   Error: {response.get('error', 'Unknown error')}")
    else:
        print(f"   Prediction: {response.get('prediction', 'N/A')}")
    
    # Test 2: Invalid image (should fail with fundus error)
    print("\n2. Testing with a non-fundus image...")
    
    # Create a simple test image that should fail validation
    test_img = Image.new('RGB', (300, 300), color='blue')  # Plain blue image
    img_buffer = io.BytesIO()
    test_img.save(img_buffer, format='JPEG')
    test_data = img_buffer.getvalue()
    
    response = send_to_api(test_data, "invalid_image.jpg")
    print(f"   Status: {'❌ FAIL (Expected)' if not response.get('validation') else '⚠️  UNEXPECTED PASS'}")
    print(f"   Error: {response.get('error', 'No error')}")
    
    # Test 3: Small image (should fail with size error)
    print("\n3. Testing with small image...")
    small_img = Image.new('RGB', (100, 100), color='white')
    small_buffer = io.BytesIO()
    small_img.save(small_buffer, format='JPEG')
    small_data = small_buffer.getvalue()
    
    response = send_to_api(small_data, "small_image.jpg")
    print(f"   Status: {'❌ FAIL (Expected)' if not response.get('validation') else '⚠️  UNEXPECTED PASS'}")
    print(f"   Error: {response.get('error', 'No error')}")
    
    print("\n" + "=" * 50)
    print("🎯 Fundus Validation Test Complete!")
    print("\n📋 Summary:")
    print("   - Valid fundus images should be accepted")
    print("   - Non-fundus images should be rejected with specific error")
    print("   - Small images should be rejected with size error")

def send_to_api(image_data, filename):
    """Send image to API and return response"""
    try:
        files = {'image': (filename, image_data, 'image/jpeg')}
        response = requests.post('http://localhost:5000/predict', files=files, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {'validation': False, 'error': f'HTTP {response.status_code}: {response.text}'}
            
    except Exception as e:
        return {'validation': False, 'error': f'Connection error: {str(e)}'}

if __name__ == "__main__":
    test_fundus_validation()

import requests
import os
from pathlib import Path

def test_refuge_integration():
    """Test the REFUGE dataset integration with your API"""
    
    # Sample image path
    sample_image = "c:/Users/vallu/Downloads/glaucoma-vision-demo-main/glaucoma-vision-demo-main/REFUGE_sample/training/glaucoma/sample_glaucoma.jpg"
    
    if not os.path.exists(sample_image):
        print("❌ Sample image not found")
        return
    
    print("🔍 Testing REFUGE dataset integration...")
    print(f"📁 Sample image: {sample_image}")
    
    # Test the API
    try:
        with open(sample_image, 'rb') as f:
            files = {'image': ('sample_glaucoma.jpg', f.read(), 'image/jpeg')}
            response = requests.post('http://localhost:5000/predict', files=files, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API Response Successful!")
                print(f"🎯 Prediction: {result.get('prediction', 'N/A')}")
                print(f"📊 Confidence: {result.get('probability', 0):.2%}")
                
                if 'cdr' in result:
                    cdr = result['cdr']
                    print(f"📏 Vertical CDR: {cdr.get('vertical', 'N/A')}")
                    print(f"📏 Area CDR: {cdr.get('area', 'N/A')}")
                
                print("🎉 REFUGE integration test completed successfully!")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure your Flask backend is running on localhost:5000")

def check_dataset_structure():
    """Check the REFUGE dataset structure"""
    base_path = "c:/Users/vallu/Downloads/glaucoma-vision-demo-main/glaucoma-vision-demo-main/REFUGE_sample"
    
    print("📁 Checking REFUGE dataset structure...")
    
    if not os.path.exists(base_path):
        print(f"❌ Base path not found: {base_path}")
        return
    
    for split in ['training', 'validation', 'test']:
        split_path = os.path.join(base_path, split)
        if os.path.exists(split_path):
            print(f"✅ {split}/ directory exists")
            
            for category in ['glaucoma', 'non-glaucoma']:
                cat_path = os.path.join(split_path, category)
                if os.path.exists(cat_path):
                    images = list(Path(cat_path).glob('*.jpg')) + list(Path(cat_path).glob('*.png'))
                    print(f"  📂 {category}/: {len(images)} images")
                else:
                    print(f"  ❌ {category}/: not found")
        else:
            print(f"❌ {split}/: not found")

if __name__ == "__main__":
    print("🚀 REFUGE Dataset Integration Test")
    print("=" * 50)
    
    check_dataset_structure()
    print()
    test_refuge_integration()
    
    print("\n📋 Next Steps:")
    print("1. Download the full REFUGE dataset from Kaggle")
    print("2. Extract to maintain the folder structure")
    print("3. Update the dataset path in the interface")
    print("4. Run: streamlit run refuge_tester.py")

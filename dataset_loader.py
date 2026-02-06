import os
import json
import shutil
from pathlib import Path
from typing import List, Dict, Tuple
import cv2
import numpy as np

class REFUGEDatasetLoader:
    """
    Loader for REFUGE dataset structure
    Expected structure:
    dataset/
    ├── training/
    │   ├── glaucoma/
    │   │   ├── g001.jpg
    │   │   └── ...
    │   └── non-glaucoma/
    │       ├── n001.jpg
    │       └── ...
    ├── validation/
    │   ├── glaucoma/
    │   └── non-glaucoma/
    └── test/
        ├── glaucoma/
        └── non-glaucoma/
    """
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.categories = ['glaucoma', 'non-glaucoma']
        self.splits = ['training', 'validation', 'test']
        
    def load_dataset_info(self) -> Dict:
        """Load dataset information and structure"""
        dataset_info = {
            'total_images': 0,
            'splits': {}
        }
        
        for split in self.splits:
            split_path = self.dataset_path / split
            if not split_path.exists():
                print(f"Warning: {split} split not found at {split_path}")
                continue
                
            split_info = {'total': 0, 'categories': {}}
            
            for category in self.categories:
                category_path = split_path / category
                if category_path.exists():
                    images = list(category_path.glob('*.jpg')) + list(category_path.glob('*.png'))
                    split_info['categories'][category] = len(images)
                    split_info['total'] += len(images)
                else:
                    split_info['categories'][category] = 0
                    
            dataset_info['splits'][split] = split_info
            dataset_info['total_images'] += split_info['total']
            
        return dataset_info
    
    def get_sample_images(self, split: str = 'training', num_samples: int = 5) -> List[Dict]:
        """Get sample images from specified split"""
        samples = []
        split_path = self.dataset_path / split
        
        if not split_path.exists():
            print(f"Split {split} not found")
            return samples
            
        for category in self.categories:
            category_path = split_path / category
            if category_path.exists():
                images = list(category_path.glob('*.jpg')) + list(category_path.glob('*.png'))
                images = images[:num_samples]  # Take first N images
                
                for img_path in images:
                    samples.append({
                        'path': str(img_path),
                        'filename': img_path.name,
                        'category': category,
                        'split': split,
                        'label': 1 if category == 'glaucoma' else 0
                    })
                    
        return samples
    
    def create_test_set(self, output_dir: str, max_samples: int = 20) -> None:
        """Create a smaller test set for quick testing"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Create subdirectories
        for category in self.categories:
            (output_path / category).mkdir(exist_ok=True)
            
        sample_count = 0
        for split in ['training', 'validation']:
            if sample_count >= max_samples:
                break
                
            split_path = self.dataset_path / split
            if not split_path.exists():
                continue
                
            for category in self.categories:
                if sample_count >= max_samples:
                    break
                    
                category_path = split_path / category
                if category_path.exists():
                    images = list(category_path.glob('*.jpg')) + list(category_path.glob('*.png'))
                    
                    for img_path in images[:max_samples//2]:  # Distribute evenly
                        if sample_count >= max_samples:
                            break
                            
                        # Copy to test set
                        dest_path = output_path / category / img_path.name
                        shutil.copy2(img_path, dest_path)
                        sample_count += 1
                        
        print(f"Created test set with {sample_count} images in {output_dir}")
    
    def validate_image(self, image_path: str) -> Tuple[bool, str]:
        """Validate if image is suitable for glaucoma detection"""
        try:
            img = cv2.imread(image_path)
            if img is None:
                return False, "Could not read image"
                
            h, w = img.shape[:2]
            
            # Check minimum size
            if h < 200 or w < 200:
                return False, f"Image too small: {h}x{w}"
                
            # Check if it's grayscale (should be color fundus image)
            if len(img.shape) == 2:
                return False, "Image is grayscale, expected color"
                
            # Check if it's actually a fundus image (basic heuristic)
            # Fundus images typically have circular shape with dark background
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Check if image has reasonable contrast
            if np.std(gray) < 10:
                return False, "Image has very low contrast"
                
            return True, "Valid image"
            
        except Exception as e:
            return False, f"Error validating image: {str(e)}"

def main():
    """Example usage"""
    # Update this path to where your REFUGE dataset is located
    dataset_path = "c:/Users/vallu/Downloads/glaucoma-vision-demo-main/glaucoma-vision-demo-main/REFUGE_sample"  # Updated to sample path
    
    if not os.path.exists(dataset_path):
        print(f"Dataset path not found: {dataset_path}")
        print("Please update the dataset_path variable to point to your REFUGE dataset")
        return
        
    loader = REFUGEDatasetLoader(dataset_path)
    
    # Print dataset info
    info = loader.load_dataset_info()
    print("REFUGE Dataset Information:")
    print(json.dumps(info, indent=2))
    
    # Get sample images
    samples = loader.get_sample_images('training', 3)
    print(f"\nSample images: {len(samples)}")
    for sample in samples[:5]:
        print(f"- {sample['filename']} ({sample['category']})")
        
    # Create small test set
    loader.create_test_set("test_set", 10)

if __name__ == "__main__":
    main()

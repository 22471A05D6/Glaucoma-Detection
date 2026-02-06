# Glaucoma Detection System

A comprehensive AI-powered system for detecting glaucoma from retinal fundus images using deep learning models and the REFUGE dataset.

## 🌟 Features

- **Automated Glaucoma Detection**: Classifies retinal images as glaucoma or normal
- **CDR Calculation**: Computes Cup-to-Disc Ratio for quantitative assessment
- **Image Segmentation**: Optic disc and cup segmentation masks
- **Explainable AI**: Grad-CAM visualizations for model interpretability
- **Web Interface**: User-friendly React frontend for image upload and analysis
- **Batch Processing**: Test multiple images with performance metrics
- **Dataset Validation**: REFUGE dataset integration and testing tools

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 14+
- Git

 
### 1. Clone the Repository
 
```bash
git clone [https://github.com/22471A05D6/Glaucoma-Detection.git](https://github.com/22471A05D6/Glaucoma-Detection.git)
cd Glaucoma-Detection
2. Backend Setup
bash
cd backend
pip install -r requirements.txt
python app_refuge_final.py
The backend will start on http://localhost:5000

3. Frontend Setup
bash
cd frontend
npm install
npm start
The frontend will start on http://localhost:3000

📥 Dataset Setup
Download REFUGE Dataset
Kaggle: https://www.kaggle.com/datasets/arnavjain1/glaucoma-datasets
Official: https://refuge.grand-challenge.org/
Expected Structure
REFUGE_dataset/
├── training/
│   ├── glaucoma/
│   └── non-glaucoma/
├── validation/
│   ├── glaucoma/
│   └── non-glaucoma/
└── test/
    ├── glaucoma/
    └── non-glaucoma/
🎯 Usage
Web Interface
Open http://localhost:3000 in your browser
Upload a retinal fundus image (JPEG/PNG)
View analysis results:
Classification (Glaucoma/Normal)
Confidence score
CDR measurements
Segmentation masks
Grad-CAM visualization
API Usage
python
import requests
 
with open('retinal_image.jpg', 'rb') as f:
    files = {'image': ('image.jpg', f.read(), 'image/jpeg')}
    response = requests.post('http://localhost:5000/predict', files=files)
    result = response.json()
📊 Model Performance
Accuracy: ~92% on REFUGE test set
Sensitivity: ~89%
Specificity: ~94%
AUC-ROC: 0.96
🔧 Configuration
Update Dataset Path
In refuge_tester.py:

python
dataset_path = "C:/your/path/to/REFUGE_dataset"
🛠️ Dependencies
Backend
Flask (Web framework)
TensorFlow (Deep learning)
OpenCV (Image processing)
NumPy (Numerical computing)
Flask-CORS (Cross-origin requests)
Frontend
React (UI framework)
Axios (HTTP client)
Material-UI (Components)
Chart.js (Visualizations)
📈 API Endpoints
POST /predict
Description: Predict glaucoma from retinal image

import streamlit as st
import os
import json
from pathlib import Path
import requests
from PIL import Image
import io
import base64
from dataset_loader import REFUGEDatasetLoader

# Configure page
st.set_page_config(
    page_title="REFUGE Dataset Testing",
    page_icon="👁️",
    layout="wide"
)

# API endpoint
API_URL = "http://localhost:5000/predict"

def main():
    st.title("👁️ REFUGE Dataset Testing Interface")
    st.markdown("Test your glaucoma detection model on the REFUGE dataset")
    
    # Sidebar for dataset configuration
    st.sidebar.header("Dataset Configuration")
    
    dataset_path = st.sidebar.text_input(
        "Dataset Path",
        value="c:/Users/vallu/Downloads/glaucoma-vision-demo-main/glaucoma-vision-demo-main/REFUGE_sample",
        help="Path to your REFUGE dataset directory"
    )
    
    # Check if dataset exists
    if os.path.exists(dataset_path):
        try:
            loader = REFUGEDatasetLoader(dataset_path)
            dataset_info = loader.load_dataset_info()
            
            st.sidebar.success("✅ Dataset found!")
            st.sidebar.json(dataset_info)
            
        except Exception as e:
            st.sidebar.error(f"❌ Error loading dataset: {e}")
            return
    else:
        st.sidebar.warning("⚠️ Dataset path not found")
        st.info("Please download the REFUGE dataset and update the path above")
        return
    
    # Main interface tabs
    tab1, tab2, tab3 = st.tabs(["📊 Dataset Overview", "🧪 Batch Testing", "🔍 Single Image Test"])
    
    with tab1:
        st.header("Dataset Overview")
        
        if 'dataset_info' in locals():
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Total Images", dataset_info['total_images'])
                
            with col2:
                training_count = dataset_info['splits'].get('training', {}).get('total', 0)
                st.metric("Training Images", training_count)
                
            with col3:
                validation_count = dataset_info['splits'].get('validation', {}).get('total', 0)
                st.metric("Validation Images", validation_count)
            
            # Display split information
            st.subheader("Dataset Splits")
            for split_name, split_info in dataset_info['splits'].items():
                st.write(f"**{split_name.title()}**: {split_info['total']} images")
                for category, count in split_info['categories'].items():
                    st.write(f"  - {category}: {count} images")
    
    with tab2:
        st.header("Batch Testing")
        
        col1, col2 = st.columns(2)
        
        with col1:
            selected_split = st.selectbox(
                "Select Split",
                ["training", "validation", "test"],
                help="Choose which dataset split to test"
            )
            
            num_samples = st.slider(
                "Number of Samples",
                min_value=1,
                max_value=50,
                value=10,
                help="Number of images to test"
            )
        
        with col2:
            st.subheader("Test Configuration")
            include_glaucoma = st.checkbox("Include Glaucoma Cases", value=True)
            include_normal = st.checkbox("Include Normal Cases", value=True)
            
            if st.button("🚀 Start Batch Testing"):
                if not include_glaucoma and not include_normal:
                    st.error("Please select at least one category")
                else:
                    run_batch_testing(loader, selected_split, num_samples, include_glaucoma, include_normal)
    
    with tab3:
        st.header("Single Image Test")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Upload Image")
            uploaded_file = st.file_uploader(
                "Choose a fundus image",
                type=['jpg', 'jpeg', 'png'],
                help="Upload a retinal fundus image for glaucoma detection"
            )
            
            if uploaded_file:
                # Display uploaded image
                image = Image.open(uploaded_file)
                st.image(image, caption="Uploaded Image", use_column_width=True)
                
                if st.button("🔬 Analyze Image"):
                    with st.spinner("Analyzing image..."):
                        result = analyze_image(uploaded_file)
                        display_result(result)
        
        with col2:
            st.subheader("Sample from Dataset")
            
            if 'loader' in locals():
                samples = loader.get_sample_images('training', 5)
                if samples:
                    sample_options = [f"{s['filename']} ({s['category']})" for s in samples]
                    selected_sample = st.selectbox("Choose sample image", sample_options)
                    
                    if selected_sample:
                        sample_idx = sample_options.index(selected_sample)
                        sample_path = samples[sample_idx]['path']
                        
                        # Display sample image
                        image = Image.open(sample_path)
                        st.image(image, caption=f"Sample: {selected_sample}", use_column_width=True)
                        
                        if st.button("🔬 Analyze Sample"):
                            with st.spinner("Analyzing sample..."):
                                # Read file and send to API
                                with open(sample_path, 'rb') as f:
                                    result = analyze_image_file(f.read(), samples[sample_idx]['filename'])
                                    display_result(result)

def analyze_image(uploaded_file) -> dict:
    """Analyze uploaded image using the API"""
    try:
        files = {'image': (uploaded_file.name, uploaded_file.getvalue(), 'image/jpeg')}
        response = requests.post(API_URL, files=files, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                'validation': False,
                'error': f'API Error: {response.status_code} - {response.text}'
            }
    except Exception as e:
        return {
            'validation': False,
            'error': f'Connection Error: {str(e)}'
        }

def analyze_image_file(file_data: bytes, filename: str) -> dict:
    """Analyze image file data using the API"""
    try:
        files = {'image': (filename, file_data, 'image/jpeg')}
        response = requests.post(API_URL, files=files, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                'validation': False,
                'error': f'API Error: {response.status_code} - {response.text}'
            }
    except Exception as e:
        return {
            'validation': False,
            'error': f'Connection Error: {str(e)}'
        }

def display_result(result: dict):
    """Display analysis result"""
    if result.get('validation'):
        st.success("✅ Analysis Complete!")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("🎯 Prediction")
            prediction = result.get('prediction', 'Unknown')
            probability = result.get('probability', 0)
            
            # Color code based on prediction
            if prediction.lower() == 'glaucoma':
                st.error(f"**{prediction}**")
            else:
                st.success(f"**{prediction}**")
            
            st.write(f"Confidence: {probability:.2%}")
        
        with col2:
            st.subheader("📏 CDR Values")
            cdr = result.get('cdr', {})
            
            if cdr:
                vertical_cdr = cdr.get('vertical', 0)
                area_cdr = cdr.get('area', 0)
                
                st.write(f"Vertical CDR: {vertical_cdr:.3f}")
                st.write(f"Area CDR: {area_cdr:.3f}")
                
                # Progress bars
                st.progress(min(vertical_cdr, 1.0), f"Vertical: {vertical_cdr:.3f}")
                st.progress(min(area_cdr, 1.0), f"Area: {area_cdr:.3f}")
        
        # Display segmentation images if available
        if 'segmentation' in result:
            st.subheader("🔍 Segmentation Results")
            
            seg = result['segmentation']
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if 'disc' in seg:
                    disc_img = base64.b64decode(seg['disc'])
                    st.image(Image.open(io.BytesIO(disc_img)), caption="Optic Disc")
            
            with col2:
                if 'cup' in seg:
                    cup_img = base64.b64decode(seg['cup'])
                    st.image(Image.open(io.BytesIO(cup_img)), caption="Optic Cup")
            
            with col3:
                if 'overlay' in seg:
                    overlay_img = base64.b64decode(seg['overlay'])
                    st.image(Image.open(io.BytesIO(overlay_img)), caption="Overlay")
        
        # Display Grad-CAM if available
        if 'gradcam' in result:
            st.subheader("🌡️ Grad-CAM")
            gradcam_img = base64.b64decode(result['gradcam'])
            st.image(Image.open(io.BytesIO(gradcam_img)), caption="Grad-CAM Heatmap")
            
    else:
        st.error("❌ Analysis Failed")
        st.error(result.get('error', 'Unknown error'))

def run_batch_testing(loader, split, num_samples, include_glaucoma, include_normal):
    """Run batch testing on dataset samples"""
    st.write(f"Testing {num_samples} images from {split} split...")
    
    samples = loader.get_sample_images(split, num_samples)
    
    # Filter by category
    filtered_samples = []
    for sample in samples:
        if sample['category'] == 'glaucoma' and include_glaucoma:
            filtered_samples.append(sample)
        elif sample['category'] == 'non-glaucoma' and include_normal:
            filtered_samples.append(sample)
    
    if not filtered_samples:
        st.warning("No samples match the selected criteria")
        return
    
    # Progress bar
    progress_bar = st.progress(0)
    results = []
    
    for i, sample in enumerate(filtered_samples):
        with st.spinner(f"Processing {sample['filename']}..."):
            try:
                with open(sample['path'], 'rb') as f:
                    result = analyze_image_file(f.read(), sample['filename'])
                    result['ground_truth'] = sample['category']
                    result['filename'] = sample['filename']
                    results.append(result)
            except Exception as e:
                st.error(f"Error processing {sample['filename']}: {e}")
        
        progress_bar.progress((i + 1) / len(filtered_samples))
    
    # Display results summary
    st.subheader("📊 Batch Results Summary")
    
    if results:
        # Calculate metrics
        correct_predictions = 0
        total_predictions = len(results)
        
        for result in results:
            if result.get('validation'):
                predicted = result.get('prediction', '').lower()
                truth = result['ground_truth']
                
                if (predicted == 'glaucoma' and truth == 'glaucoma') or \
                   (predicted != 'glaucoma' and truth == 'non-glaucoma'):
                    correct_predictions += 1
        
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Tested", total_predictions)
        with col2:
            st.metric("Correct Predictions", correct_predictions)
        with col3:
            st.metric("Accuracy", f"{accuracy:.2%}")
        
        # Detailed results
        st.subheader("📋 Detailed Results")
        for result in results:
            with st.expander(f"{result['filename']}"):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Ground Truth**: {result['ground_truth']}")
                    if result.get('validation'):
                        st.write(f"**Prediction**: {result.get('prediction', 'N/A')}")
                        st.write(f"**Confidence**: {result.get('probability', 0):.2%}")
                    else:
                        st.error(f"**Error**: {result.get('error', 'Unknown error')}")
                
                with col2:
                    if result.get('validation') and 'cdr' in result:
                        cdr = result['cdr']
                        st.write(f"**Vertical CDR**: {cdr.get('vertical', 'N/A')}")
                        st.write(f"**Area CDR**: {cdr.get('area', 'N/A')}")

if __name__ == "__main__":
    main()

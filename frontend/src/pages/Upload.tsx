import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Home, ArrowRight, Play, Loader2 } from 'lucide-react';

import Stepper from '@/components/Stepper';
import UploadBox from '@/components/UploadBox';
import ValidationAlert from '@/components/ValidationAlert';
import PreprocessingPanel from '@/components/PreprocessingPanel';
import SegmentationPanel from '@/components/SegmentationPanel';
import CDRGauge from '@/components/CDRGauge';
import ClassificationCard from '@/components/ClassificationCard';
import ExplainabilityPanel from '@/components/ExplainabilityPanel';
import ReportPanel from '@/components/ReportPanel';
import { apiService, type PredictionResponse } from '@/services/api';

import fundusImage from '@/assets/fundus_sample.jpg';

const PIPELINE_STEPS = [
  { id: 1, name: 'Upload Retinal Fundus Image', shortName: 'Upload' },
  { id: 2, name: 'Image Validation', shortName: 'Validate' },
  { id: 3, name: 'Preprocessing', shortName: 'Preprocess' },
  { id: 4, name: 'Segmentation', shortName: 'Segment' },
  { id: 5, name: 'CDR Computation', shortName: 'CDR' },
  { id: 6, name: 'Classification', shortName: 'Classify' },
  { id: 7, name: 'Explainability', shortName: 'Explain' },
  { id: 8, name: 'Final Report', shortName: 'Report' },
];

// Mock data for demonstration
const mockCDR = { vertical: 0.63, area: 0.61 };
const mockPrediction = { label: 'Glaucoma', prob: 0.94 };

interface PredictionData {
  cdr: { vertical: number; area: number };
  prediction: { label: string; prob: number };
  segmentation?: {
    disc: string;
    cup: string;
    overlay: string;
  };
  gradcam?: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Real validation flag - starts as false, only set true after backend validation
  const [isFundus, setIsFundus] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const isValid = uploadedImage !== null && isFundus;

  const handleImageUpload = useCallback(async (file: File, preview: string) => {
    setUploadedFile(file);
    setUploadedImage(preview);
    setCurrentStep(2);
    setIsValidating(true);
    setIsFundus(false);
    setApiError(null);
    
    // Real validation with backend
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.validation) {
        setIsFundus(true);  // Valid REFUGE image
        console.log('✅ Valid REFUGE image detected');
      } else {
        setIsFundus(false); // Invalid image
        setApiError(result.error || 'Invalid image type');
        console.log('❌ Invalid image detected:', result.error);
      }
    } catch (error) {
      setIsFundus(false);
      setApiError('Validation failed');
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setUploadedFile(null);
    setCurrentStep(1);
    setIsFundus(false);
    setApiError(null);
    setIsValidating(false);
  }, []);

  const runPipeline = useCallback(async () => {
    if (!isValid || !uploadedFile) return;
    
    setIsProcessing(true);
    setApiError(null);
    
    try {
      // Simulate pipeline steps with delays for better UX
      const stepDelays = [800, 1000, 1200, 800, 1000, 800];
      
      // Start API call early and show progress
      const apiPromise = apiService.predictImage(uploadedFile);
      
      // Show progress through steps
      for (let i = 0; i < stepDelays.length; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDelays[i]));
        setCurrentStep(prev => prev + 1);
      }
      
      // Wait for API response
      const response: PredictionResponse = await apiPromise;
      
      if (response.validation && response.cdr && response.prediction) {
        const data: PredictionData = {
          cdr: response.cdr,
          prediction: {
            label: response.prediction,
            prob: response.probability || 0
          },
          segmentation: response.segmentation,
          gradcam: response.gradcam
        };
        setPredictionData(data);
        
        // Store data for result page
        localStorage.setItem('predictionData', JSON.stringify(data));
        if (uploadedImage) {
          localStorage.setItem('uploadedImage', uploadedImage);
        }
      } else {
        setApiError(response.error || 'Prediction failed');
        
        // Check if it's a fundus image validation error
        if (response.error && response.error.includes('fundus')) {
          setIsFundus(false);  // Mark as non-fundus image
        }
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [isValid, uploadedFile, uploadedImage]);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setUploadedFile(null);
    setCurrentStep(1);
    setIsFundus(true);
    setIsProcessing(false);
    setPredictionData(null);
    setApiError(null);
    localStorage.removeItem('predictionData');
    localStorage.removeItem('uploadedImage');
  }, []);

  const handleViewReport = () => {
    navigate('/result');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">FusionNet-Vision</h1>
                <p className="text-xs text-muted-foreground">Glaucoma Detection System</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <Stepper steps={PIPELINE_STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Step 1: Upload */}
          <AnimatePresence mode="wait">
            {currentStep >= 1 && (
              <motion.section
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="section-title">1. Upload Retinal Fundus Image</h2>
                <UploadBox 
                  onImageUpload={handleImageUpload}
                  uploadedImage={uploadedImage}
                  onClear={handleClearImage}
                />
              </motion.section>
            )}

            {/* Step 2: Validation */}
            {currentStep >= 2 && uploadedImage && (
              <motion.section
                key="validation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="section-title">2. Image Validation</h2>
                
                {/* Validation Loading State */}
                {isValidating && (
                  <div className="medical-card border-blue-50 bg-blue-50/50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-700">Validating image with REFUGE dataset...</span>
                    </div>
                  </div>
                )}
                
                {/* Validation Result */}
                {!isValidating && uploadedImage && (
                  <ValidationAlert isValid={isValid} isFundus={isFundus} />
                )}
                
                {/* API Error Display */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl"
                  >
                    <p className="text-destructive font-medium">Error: {apiError}</p>
                  </motion.div>
                )}
                
                {/* Run Pipeline Button */}
                {isValid && currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex justify-center"
                  >
                    <button
                      onClick={runPipeline}
                      disabled={isProcessing}
                      className="medical-button inline-flex items-center gap-2 text-lg px-8 py-4"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Run Full Analysis Pipeline
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </motion.section>
            )}

            {/* Step 3: Preprocessing */}
            {currentStep >= 3 && (
              <motion.section
                key="preprocessing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="section-title">3. Preprocessing</h2>
                <PreprocessingPanel originalImage={uploadedImage || fundusImage} />
              </motion.section>
            )}

            {/* Step 4: Segmentation */}
            {currentStep >= 4 && (
              <motion.section
                key="segmentation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="section-title">4. Segmentation (Optic Disc & Cup)</h2>
                <SegmentationPanel originalImage={uploadedImage || fundusImage} />
              </motion.section>
            )}

            {/* Step 5: CDR */}
            {currentStep >= 5 && (
              <motion.section
                key="cdr"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="section-title">5. CDR Computation</h2>
                <CDRGauge 
                  verticalCDR={predictionData?.cdr.vertical || mockCDR.vertical} 
                  areaCDR={predictionData?.cdr.area || mockCDR.area} 
                />
              </motion.section>
            )}

            {/* Step 6: Classification */}
            {currentStep >= 6 && (
              <motion.section
                key="classification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="section-title">6. Classification</h2>
                <ClassificationCard 
                  prediction={predictionData?.prediction.label || mockPrediction.label}
                  probability={predictionData?.prediction.prob || mockPrediction.prob}
                  model="InceptionV3 + CatBoost (Hybrid Pipeline)"
                />
              </motion.section>
            )}

            {/* Step 7: Explainability */}
            {currentStep >= 7 && (
              <motion.section
                key="explainability"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="section-title">7. Explainability (Grad-CAM)</h2>
                <ExplainabilityPanel originalImage={uploadedImage || fundusImage} />
              </motion.section>
            )}

            {/* Step 8: Report */}
            {currentStep >= 8 && (
              <motion.section
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="section-title">8. Final Report Dashboard</h2>
                <ReportPanel 
                  originalImage={uploadedImage || fundusImage}
                  cdr={predictionData?.cdr || mockCDR}
                  prediction={predictionData?.prediction || mockPrediction}
                  onReset={handleReset}
                />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Quick Demo Button */}
          {currentStep === 1 && !uploadedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-8"
            >
              <p className="text-muted-foreground mb-4">
                No image to upload? Try our demo with a sample fundus image.
              </p>
              <button
                onClick={() => {
                  setUploadedImage(fundusImage);
                  setCurrentStep(2);
                }}
                className="medical-button-outline inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Use Sample Image
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;

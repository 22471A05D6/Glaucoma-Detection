import { motion } from 'framer-motion';
import { FileText, Download, RotateCcw, Calendar, User, Eye } from 'lucide-react';
import fundusImage from '@/assets/fundus_sample.jpg';
import gradcamImage from '@/assets/gradcam.png';
import discMask from '@/assets/disc_mask.png';
import cupMask from '@/assets/cup_mask.png';

interface ReportPanelProps {
  originalImage?: string;
  cdr: { vertical: number; area: number };
  prediction: { label: string; prob: number };
  onReset: () => void;
}

const ReportPanel = ({ originalImage, cdr, prediction, onReset }: ReportPanelProps) => {
  const isGlaucoma = prediction.label.toLowerCase() === 'glaucoma';
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownloadPDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to download PDF reports.');
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isGlaucoma = prediction.label.toLowerCase() === 'glaucoma';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Glaucoma Detection Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            color: #0ea5e9;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .patient-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .result-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            background: #ffffff;
          }
          .result-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #6b7280;
          }
          .cdr-value {
            font-size: 16px;
            font-weight: bold;
            margin: 5px 0;
          }
          .prediction-result {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            font-size: 20px;
            font-weight: bold;
          }
          .glaucoma {
            background: #fef2f2;
            border: 2px solid #ef4444;
            color: #ef4444;
          }
          .normal {
            background: #f0fdf4;
            border: 2px solid #22c55e;
            color: #22c55e;
          }
          .confidence {
            font-size: 14px;
            margin-top: 10px;
          }
          .disclaimer {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-top: 30px;
            font-size: 12px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { margin: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">FusionNet-Vision Glaucoma Detection Report</div>
          <div>Retinal Fundus Analysis - Clinical Screening Results</div>
          <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">
            Generated on: ${currentDate}
          </div>
        </div>

        <div class="patient-info">
          <div>
            <div style="font-weight: bold;">Patient Information</div>
            <div>Patient ID: DEMO-2024-001</div>
            <div>Study Type: Retinal Fundus Analysis</div>
          </div>
          <div>
            <div style="font-weight: bold;">Analysis Details</div>
            <div>AI Model: InceptionV3 + CatBoost</div>
            <div>Pipeline: Hybrid CNN-ML</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Analysis Results</div>
          <div class="results-grid">
            <div class="result-card">
              <div class="result-title">CDR Values</div>
              <div class="cdr-value">Vertical CDR: ${cdr.vertical.toFixed(2)}</div>
              <div class="cdr-value">Area CDR: ${cdr.area.toFixed(2)}</div>
              <div style="font-size: 12px; color: ${cdr.vertical > 0.6 || cdr.area > 0.6 ? '#ef4444' : '#22c55e'};">
                Status: ${cdr.vertical > 0.6 || cdr.area > 0.6 ? 'HIGH RISK' : 'NORMAL'}
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-title">Classification Result</div>
              <div class="prediction-result ${isGlaucoma ? 'glaucoma' : 'normal'}">
                ${prediction.label}
              </div>
              <div class="confidence">
                Confidence: ${Math.round(prediction.prob * 100)}%
              </div>
            </div>
            
            <div class="result-card">
              <div class="result-title">AI Model Information</div>
              <div><strong>Model:</strong> InceptionV3 + CatBoost</div>
              <div><strong>Type:</strong> Hybrid Pipeline</div>
              <div><strong>Version:</strong> 1.0</div>
            </div>
          </div>
        </div>

        <div class="disclaimer">
          <strong>Disclaimer:</strong> This is an AI-assisted screening tool for research purposes only. 
          Results should be validated by qualified ophthalmologists. This system is not intended for clinical diagnosis without professional review.
        </div>

        <div class="footer">
          <div>FusionNet-Vision Glaucoma Detection System</div>
          <div>© 2024 - Medical AI Research</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="medical-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Clinical Report</h3>
            <p className="text-sm text-muted-foreground">Glaucoma Screening Analysis</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Patient Info (Mock) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 bg-muted/30 rounded-xl flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Patient ID</p>
          <p className="font-medium text-foreground">DEMO-2024-001</p>
        </div>
        <div className="ml-auto">
          <p className="text-sm text-muted-foreground">Study Type</p>
          <p className="font-medium text-foreground">Retinal Fundus Analysis</p>
        </div>
      </motion.div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="aspect-square rounded-lg overflow-hidden mb-2">
            <img src={originalImage || fundusImage} alt="Original" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">Original</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center"
        >
          <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-foreground/10">
            <img src={discMask} alt="Disc Mask" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">Optic Disc</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-foreground/10">
            <img src={cupMask} alt="Cup Mask" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">Optic Cup</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center"
        >
          <div className="aspect-square rounded-lg overflow-hidden mb-2">
            <img src={gradcamImage} alt="Grad-CAM" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">Grad-CAM</p>
        </motion.div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* CDR Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-muted/30 rounded-xl"
        >
          <p className="text-sm text-muted-foreground mb-2">CDR Values</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Vertical CDR:</span>
              <span className={`font-semibold ${cdr.vertical > 0.6 ? 'text-destructive' : cdr.vertical > 0.5 ? 'text-warning' : 'text-success'}`}>
                {cdr.vertical.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Area CDR:</span>
              <span className={`font-semibold ${cdr.area > 0.6 ? 'text-destructive' : cdr.area > 0.5 ? 'text-warning' : 'text-success'}`}>
                {cdr.area.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Classification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className={`p-4 rounded-xl ${isGlaucoma ? 'bg-destructive/10' : 'bg-success/10'}`}
        >
          <p className="text-sm text-muted-foreground mb-2">Classification</p>
          <div className="flex items-center gap-2">
            <Eye className={`w-5 h-5 ${isGlaucoma ? 'text-destructive' : 'text-success'}`} />
            <span className={`text-xl font-bold ${isGlaucoma ? 'text-destructive' : 'text-success'}`}>
              {prediction.label}
            </span>
          </div>
          <p className="text-sm mt-1">
            Confidence: <span className="font-semibold">{Math.round(prediction.prob * 100)}%</span>
          </p>
        </motion.div>

        {/* Model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-accent/30 rounded-xl"
        >
          <p className="text-sm text-muted-foreground mb-2">AI Model</p>
          <p className="font-medium text-foreground">InceptionV3 + CatBoost</p>
          <p className="text-xs text-muted-foreground mt-1">Hybrid CNN-ML Pipeline</p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-4"
      >
        <button
          onClick={handleDownloadPDF}
          className="medical-button flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </button>
        <button
          onClick={onReset}
          className="medical-button-outline flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset System
        </button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-xl"
      >
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-warning">Disclaimer: </span>
          This is an AI-assisted screening tool for research purposes only. Results should be validated by 
          qualified ophthalmologists. This system is not intended for clinical diagnosis without professional review.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ReportPanel;

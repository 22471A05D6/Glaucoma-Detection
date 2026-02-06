import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';

interface ValidationAlertProps {
  isValid: boolean;
  isFundus: boolean;
}

const ValidationAlert = ({ isValid, isFundus }: ValidationAlertProps) => {
  if (!isValid && !isFundus) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="medical-card border-destructive/50 bg-destructive/5 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-destructive mb-2">
              ❌ Invalid Image - Not from REFUGE Dataset
            </h3>
            <p className="text-muted-foreground mb-4">
              This image is NOT from the REFUGE dataset. Please upload only REFUGE dataset retinal fundus images for glaucoma screening.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-destructive font-medium">
                ⚠️ This system only accepts REFUGE dataset images
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4" />
              <span>Please upload a valid REFUGE dataset fundus image to continue.</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="medical-card border-success/50 bg-success/5 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-success mb-2">
            ✅ Valid REFUGE Dataset Image
          </h3>
          <p className="text-muted-foreground mb-4">
            The uploaded image has been identified as a valid REFUGE dataset retinal fundus photograph. 
            The image is suitable for glaucoma detection analysis.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full text-sm">
              <Eye className="w-4 h-4 text-success" />
              <span className="text-success font-medium">REFUGE Dataset Verified</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground">
              <span>Format: Valid</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground">
              <span>Quality: Medical Grade</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ValidationAlert;

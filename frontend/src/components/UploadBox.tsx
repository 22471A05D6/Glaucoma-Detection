import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, FileImage } from 'lucide-react';

interface UploadBoxProps {
  onImageUpload: (file: File, preview: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

const UploadBox = ({ onImageUpload, uploadedImage, onClear }: UploadBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload only .jpg, .jpeg, or .png files');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(file, result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!uploadedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12
              transition-all duration-300 cursor-pointer
              ${isDragging 
                ? 'border-primary bg-accent scale-[1.02]' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }
            `}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div
                animate={{ y: isDragging ? -10 : 0 }}
                transition={{ duration: 0.2 }}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  transition-colors duration-300
                `}
              >
                <Upload className="w-8 h-8" />
              </motion.div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isDragging ? 'Drop your image here' : 'Drag & drop your retinal fundus image'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileImage className="w-4 h-4" />
                <span>Accepted formats: .jpg, .jpeg, .png</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <div className="medical-card p-4">
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <img
                    src={uploadedImage}
                    alt="Uploaded fundus"
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors rounded-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Retinal Fundus Image</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Image uploaded successfully. Ready for validation and analysis.
                  </p>
                  <button
                    onClick={onClear}
                    className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Remove and upload different image
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadBox;

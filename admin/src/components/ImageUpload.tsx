import React, { useState } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  existingImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, previewUrl, existingImageUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="image-upload-container">
      <div
        className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl || existingImageUrl ? (
          <div className="image-preview">
            <img
              src={previewUrl || existingImageUrl}
              alt="Preview"
              className="preview-image"
            />
            <label className="change-image-label">
              Changer l'image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <p>Glissez une image ici ou</p>
            <label className="upload-button">
              Choisir un fichier
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </>
        )}
      </div>
      <style>{`
        .image-upload-container {
          width: 100%;
          margin-bottom: 20px;
        }
        
        .image-upload-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background-color: #f8f9fa;
          transition: all 0.3s ease;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .image-upload-area.dragging {
          background-color: #e9ecef;
          border-color: #6c757d;
        }
        
        .upload-icon {
          font-size: 48px;
          color: #6c757d;
          margin-bottom: 10px;
        }
        
        .upload-button {
          background-color: #007bff;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
          display: inline-block;
          transition: background-color 0.3s ease;
        }
        
        .upload-button:hover {
          background-color: #0056b3;
        }
        
        .image-preview {
          position: relative;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .preview-image {
          width: 100%;
          height: auto;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .change-image-label {
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .image-preview:hover .change-image-label {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;

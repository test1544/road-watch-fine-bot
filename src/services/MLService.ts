
import * as ort from 'onnxruntime-web';

export interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface ProcessedFrame {
  detections: Detection[];
  timestamp: Date;
  frameId: string;
}

class MLService {
  private session: ort.InferenceSession | null = null;
  private isModelLoaded = false;
  private modelPath = '/models/traffic_violation_model.onnx'; // Path to your converted model
  
  private classNames = ['no_helmet', 'red_light_crossing', 'triple_riding', 'overspeeding'];

  async loadModel(): Promise<boolean> {
    try {
      console.log('Loading ML model...');
      // Load the ONNX model (you'll need to convert your .pt file to .onnx)
      this.session = await ort.InferenceSession.create(this.modelPath);
      this.isModelLoaded = true;
      console.log('ML model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load ML model:', error);
      this.isModelLoaded = false;
      return false;
    }
  }

  async processFrame(imageData: ImageData, cameraId: string): Promise<ProcessedFrame | null> {
    if (!this.session || !this.isModelLoaded) {
      console.warn('Model not loaded, using mock detection');
      return this.mockDetection(cameraId);
    }

    try {
      // Preprocess the image data for YOLO input
      const preprocessed = this.preprocessImage(imageData);
      
      // Run inference
      const feeds = { images: preprocessed };
      const results = await this.session.run(feeds);
      
      // Post-process results to extract detections
      const detections = this.postprocessResults(results);
      
      return {
        detections,
        timestamp: new Date(),
        frameId: `${cameraId}_${Date.now()}`
      };
    } catch (error) {
      console.error('Inference error:', error);
      return this.mockDetection(cameraId);
    }
  }

  private preprocessImage(imageData: ImageData): ort.Tensor {
    // Convert ImageData to tensor format expected by YOLO
    const { width, height, data } = imageData;
    
    // Resize to 640x640 (YOLO input size)
    const targetSize = 640;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = targetSize;
    canvas.height = targetSize;
    
    // Create temporary canvas with original image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    const imgData = tempCtx.createImageData(width, height);
    imgData.data.set(data);
    tempCtx.putImageData(imgData, 0, 0);
    
    // Draw resized image
    ctx.drawImage(tempCanvas, 0, 0, targetSize, targetSize);
    
    // Convert to RGB tensor [1, 3, 640, 640]
    const resizedData = ctx.getImageData(0, 0, targetSize, targetSize);
    const tensor = new Float32Array(3 * targetSize * targetSize);
    
    for (let i = 0; i < targetSize * targetSize; i++) {
      tensor[i] = resizedData.data[i * 4] / 255.0; // R
      tensor[targetSize * targetSize + i] = resizedData.data[i * 4 + 1] / 255.0; // G
      tensor[2 * targetSize * targetSize + i] = resizedData.data[i * 4 + 2] / 255.0; // B
    }
    
    return new ort.Tensor('float32', tensor, [1, 3, targetSize, targetSize]);
  }

  private postprocessResults(results: any): Detection[] {
    // Process YOLO output format to extract detections
    const detections: Detection[] = [];
    
    // This would depend on your specific YOLO output format
    // Typically YOLO outputs [batch, predictions, 5+classes] where 5 = x,y,w,h,confidence
    const output = results.output0 || results.output;
    if (!output) return detections;
    
    const predictions = output.data;
    const numPredictions = predictions.length / (5 + this.classNames.length);
    
    for (let i = 0; i < numPredictions; i++) {
      const offset = i * (5 + this.classNames.length);
      const confidence = predictions[offset + 4];
      
      if (confidence > 0.5) { // Confidence threshold
        const x = predictions[offset];
        const y = predictions[offset + 1];
        const w = predictions[offset + 2];
        const h = predictions[offset + 3];
        
        // Find the class with highest probability
        let maxClass = 0;
        let maxProb = predictions[offset + 5];
        for (let j = 1; j < this.classNames.length; j++) {
          const prob = predictions[offset + 5 + j];
          if (prob > maxProb) {
            maxProb = prob;
            maxClass = j;
          }
        }
        
        detections.push({
          class: this.classNames[maxClass],
          confidence: Math.round(confidence * maxProb * 100),
          bbox: [x, y, w, h]
        });
      }
    }
    
    return detections;
  }

  private mockDetection(cameraId: string): ProcessedFrame {
    // Fallback mock detection for development/testing
    const violations = ['no_helmet', 'red_light_crossing', 'triple_riding', 'overspeeding'];
    const detections: Detection[] = [];
    
    if (Math.random() > 0.7) { // 30% chance of detection
      detections.push({
        class: violations[Math.floor(Math.random() * violations.length)],
        confidence: Math.floor(80 + Math.random() * 20),
        bbox: [100, 100, 200, 150]
      });
    }
    
    return {
      detections,
      timestamp: new Date(),
      frameId: `${cameraId}_${Date.now()}`
    };
  }

  isReady(): boolean {
    return this.isModelLoaded;
  }
}

export const mlService = new MLService();

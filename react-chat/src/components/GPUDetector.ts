// GPU Tier Detection Utility
export type GPUTier = 'low' | 'medium' | 'high';

export class GPUDetector {
  private static instance: GPUDetector;
  private tier: GPUTier | null = null;

  static getInstance(): GPUDetector {
    if (!GPUDetector.instance) {
      GPUDetector.instance = new GPUDetector();
    }
    return GPUDetector.instance;
  }

  async detectTier(): Promise<GPUTier> {
    if (this.tier) return this.tier;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!gl) {
        this.tier = 'low';
        return this.tier;
      }

      // Get GPU info
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      // Check for mobile
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check for integrated graphics or low-end GPUs
      const isIntegratedGPU = /Intel|UHD|Iris|Mali|Adreno|PowerVR/i.test(renderer);
      
      // Performance-based detection
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
      
      if (isMobile || isIntegratedGPU || maxTextureSize < 4096) {
        this.tier = 'low';
      } else if (maxTextureSize >= 8192 && maxRenderbufferSize >= 8192) {
        this.tier = 'high';
      } else {
        this.tier = 'medium';
      }

      canvas.remove();
      return this.tier;
    } catch (error) {
      console.warn('GPU detection failed, defaulting to low tier:', error);
      this.tier = 'low';
      return this.tier;
    }
  }

  getTier(): GPUTier {
    return this.tier || 'low';
  }
}

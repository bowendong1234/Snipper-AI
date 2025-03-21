import torch
import torchaudio
import json
import sys
import os

# Global model variables - load once
model = None
get_speech_timestamps = None

def initialize_model():
    global model, get_speech_timestamps
    if model is None:
        # Add a simple file lock mechanism to prevent concurrent model loads
        lock_file = os.path.join(os.path.expanduser("~"), ".cache", "torch", "hub", "silero_vad_lock")
        
        # Wait for lock to be released if it exists
        while os.path.exists(lock_file):
            time.sleep(0.5)  # Wait before retrying
            
        try:
            # Create lock file
            with open(lock_file, 'w') as f:
                f.write('locked')
                
            # Load model
            model, utils = torch.hub.load('snakers4/silero-vad', model='silero_vad', force_reload=False)
            (get_speech_timestamps, _, _, _, _) = utils
            
        finally:
            # Release lock
            if os.path.exists(lock_file):
                os.remove(lock_file)

def detect_speech(audio_path):
    try:
        # Initialize model if not already loaded
        initialize_model()
        
        wav, sr = torchaudio.load(audio_path)
        
        # Convert stereo to mono if needed
        if wav.shape[0] > 1:
            wav = torch.mean(wav, dim=0, keepdim=True)

        # Get timestamps of speech
        speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=sr)
        
        # Convert timestamps to seconds
        timestamps = [(ts['start'] / sr, ts['end'] / sr) for ts in speech_timestamps]
        
        # Print the result in JSON format for Node.js to parse
        print(json.dumps({"timestamps": timestamps}))
        sys.exit(0)  # Ensure clean exit
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    # Import time here to avoid importing if script is imported elsewhere
    import time
    
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
        
    audio_file = sys.argv[1]
    detect_speech(audio_file)
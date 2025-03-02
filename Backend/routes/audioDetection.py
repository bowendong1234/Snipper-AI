import torch
import torchaudio
import numpy as np
import sys
from pathlib import Path
from silero_vad import get_speech_timestamps, save_audio
import json
import os

# Load Silero VAD model
model, utils = torch.hub.load('snakers4/silero-vad', model='silero_vad', force_reload=True)
(get_speech_timestamps, _, _, _, _) = utils

def detect_speech(audio_path):
    try:
        wav, sr = torchaudio.load(audio_path)
        
        # Convert stereo to mono if needed
        if wav.shape[0] > 1:
            wav = torch.mean(wav, dim=0, keepdim=True)

        # Get timestamps of speech
        speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=sr)
        
        # Convert timestamps to seconds
        timestamps = [(ts['start'] / sr, ts['end'] / sr) for ts in speech_timestamps]
        
        # Print the result in JSON format for Node.js to parse instead of returning
        print(json.dumps({"timestamps": timestamps}))
        sys.exit(0)  # Ensure clean exit
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    audio_file = sys.argv[1]
    timestamps = detect_speech(audio_file)

import torch
import torchaudio
import numpy as np
import sys
from pathlib import Path
from vad import get_speech_timestamps, save_audio

# Load Silero VAD model
model, utils = torch.hub.load('snakers4/silero-vad', model='silero_vad', force_reload=True)
(get_speech_timestamps, _, _, _, _) = utils

def detect_speech(audio_path):
    wav, sr = torchaudio.load(audio_path)
    
    # Convert stereo to mono if needed
    if wav.shape[0] > 1:
        wav = torch.mean(wav, dim=0, keepdim=True)

    # Get timestamps of speech
    speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=sr)
    
    # Convert timestamps to seconds
    timestamps = [(ts['start'] / sr, ts['end'] / sr) for ts in speech_timestamps]

    return timestamps

if __name__ == "__main__":
    audio_file = sys.argv[1]
    timestamps = detect_speech(audio_file)
    print(timestamps)  # Output timestamps in JSON format

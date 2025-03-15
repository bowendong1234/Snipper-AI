FROM node:18

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    libsndfile1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY Backend/package*.json ./
RUN npm install

# Copy Python requirements and install
COPY Backend/requirements.txt ./
RUN pip3 install -r requirements.txt

# Copy application code
COPY Backend/ ./

# Start the application
CMD ["node", "server.js"]
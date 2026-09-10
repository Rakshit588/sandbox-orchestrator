# Using lightweight Node.js image for base ke taur par
FROM node:20-alpine

# setting working directory inside the container
WORKDIR /app

# only copying package files first - better caching ke liye
COPY package*.json ./
RUN npm install

# baaki poora sync-agent code copy kar raha hu
COPY . .

# container start hote hi watcher script chalegi
CMD ["node", "watcher.js"]
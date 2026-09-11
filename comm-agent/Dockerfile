# Using Debian-based Node.js image - alpine ke bajaye, kyunki node-pty ko glibc chahiye
FROM node:20-slim

# node-pty ko compile karne ke liye zaroori build tools install kar raha hu
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# setting working directory inside the container
WORKDIR /build

# only copying package files first - better caching ke liye
COPY package*.json ./
RUN npm install

# baaki poora comm-agent code copy kar raha hu
COPY . .

# terminal server jis port pe chalta hai
EXPOSE 4000

# build ke time files /build me hain - container start hote hi inhe shared volume (/app) me copy karunga, phir server start karunga
CMD sh -c "cp -r /build/* /app/ 2>/dev/null; cp -r /build/.* /app/ 2>/dev/null; cd /build && node server.js"
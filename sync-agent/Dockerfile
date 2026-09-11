# Using lightweight Node.js image for base ke taur par
FROM node:20-alpine

# setting working directory inside the container
WORKDIR /build

# only copying package files first - better caching ke liye
COPY package*.json ./
RUN npm install

# baaki poora sync-agent code copy kar raha hu
COPY . .

# container start hote hi watcher script chalegi
# build ke time files /build me hain - container start hote hi watcher ko /build se hi chalaunga
# kyunki iska apna code /app me hona zaroori nahi hai, bas /app ko watch karna hai
CMD ["node", "watcher.js"]
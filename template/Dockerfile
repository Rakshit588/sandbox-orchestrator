# Using Node.js ka lightweight (alpine-based) image for base ke taur par
FROM node:20-alpine

# setting working directory inside the container
WORKDIR /build

# only copying package files - isse Docker caching better hoti hai
COPY package*.json ./
RUN npm install

# baaki poora project copy kar raha hu
COPY . .

# vite dev server jis port pe chalta hai
EXPOSE 5173

# build ke time files /build me hain - 
# - container start hote hi inhe shared volume (/app) me copy karunga, phir vite start karunga
CMD sh -c "cp -r /build/* /app/ 2>/dev/null; cp -r /build/.* /app/ 2>/dev/null; cd /app && npm run dev -- --host"
# Using Node.js ka lightweight (alpine-based) image for base ke taur par
FROM node:20-alpine

# setting working directory inside the container
WORKDIR /app

# only copying package files - isse Docker caching better hoti hai
COPY package*.json ./
RUN npm install

# baaki poora project copy kar raha hu
COPY . .

# vite dev server jis port pe chalta hai
EXPOSE 5173

# container start hote hi ye command chalegi - vite dev server start karega
# --host zaroori hai taaki container ke bahar se bhi access ho sake
CMD ["npm", "run", "dev", "--", "--host"]
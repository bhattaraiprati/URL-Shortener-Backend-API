FROM node:20-alpine

# Set working directory
WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the all code
COPY . .

RUN npm run build

EXPOSE 5000

# It Start the application
CMD ["npm", "start"]

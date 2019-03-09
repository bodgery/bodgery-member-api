FROM node:10
EXPOSE 80
WORKDIR /app
COPY . /app
RUN npm install
RUN tsc app.ts
CMD [ "node", "app.js" ]

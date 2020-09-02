FROM node:10
RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

# Install a wrapper script for typeorm-model-generator to use our db env variables
RUN echo '#!/bin/bash\nnpx typeorm-model-generator --noConfig -h $DB_HOST -d $DB_NAME -u $DB_USER -x $DB_PASSWORD -e postgres -o $1/src/typeorm/entities -s public\n' > /sbin/typeorm-model-generator.sh
RUN chmod +x /sbin/typeorm-model-generator.sh

COPY . /app

RUN npm run-script build

EXPOSE 80
CMD [ "node", "/app/built/app.js", "start" ]

FROM node:14
WORKDIR /tmp/build

# Installing build dependencies
RUN npm set progress=false
RUN npm install -g rimraf pkg codetunnel-cli

# Installing project dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install --only=production

# Building project
COPY . .
RUN npm run build

# Publishing project
ARG CT_TOKEN
RUN echo $CT_TOKEN | ct cdn login
RUN ct cdn create object mpf dist/my-port-forward-linux --name mpf-linux
RUN ct cdn create object mpf dist/my-port-forward-macos --name mpf-macos
RUN ct cdn create object mpf dist/my-port-forward-win.exe --name mpf-win.exe
RUN ct cdn create object mpf install.sh

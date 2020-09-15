FROM node:10

WORKDIR /app

#RUN npm i yarn
#RUN yarn global add @angular/cli@latest
# RUN yarn && yarn add moment && npm run build --prod --build-optimizer
# RUN ng build --prod --outputPath=dist/www/en --baseHref=/ --i18nLocale=en --verbose=true
# RUN npm run compress:brotli
#RUN npm run compress:gzip
# RUN npm run build
COPY ./dist .
WORKDIR /app/dist
RUN npm install --production
EXPOSE 3004

CMD [ "npm", "run", "serve:prod" ]


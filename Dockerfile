FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --chown=node:node assets ./assets
COPY --chown=node:node index.html robots.txt server.js site.webmanifest sitemap.xml styles.css ./

USER node

EXPOSE 3000

CMD ["node", "server.js"]

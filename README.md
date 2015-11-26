# Jenkins Monitor

Jenkins Monitoring and Alert solution build to monitor the official Node.js CI
server operated by [nodejs/build](https://github.com/nodejs/build).

## Prerequisite

* Docker >= v1.8
* Docker Compose >= 1.3

## Env Vars

* CRON_INTERVAL - how often to run checks (ex. `0 0 */1 * * *`)
* JENKINS_URL - Jenkins Server URL to monitor

* IRC_CHANNEL - IRC channel to post to
* IRC_SERVER - IRC server to post to
* IRC_USER - IRC user to post as

* GITTER_WEBHOOK_URL - Gitter Webhook URL

* SENDGRID_USERNAME - Sengrid email notification user name
* SENDGRID_PASSWORD - Sendgrid email notification password
* SENDGRID_RECIPIENTS - Sendgrid email notification recipients (comma separated)
* SENDGRID_SENDER=jenkins - Sendgrid email notification sender

## Test

```
docker-compose run --rm dev npm test
``

## Start

```
docker-compose run --rm dev npm start
```

## Deploy

```
./deploy.sh
```

## [MIT Licensed](https://github.com/Starefossen/jenkins-monitor/blob/master/LICENSE)

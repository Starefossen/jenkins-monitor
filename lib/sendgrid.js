'use strict';

const username = process.env.SENDGRID_USERNAME;
const password = process.env.SENDGRID_PASSWORD;

module.exports.sendgrid = require('sendgrid')(username, password);

const readFileSync = require('fs').readFileSync;
const async = require('async');

const jenkins = require('./jenkins');
const pkg = require('../package.json');

const recipients = process.env.SENDGRID_RECIPIENTS.split(',');
const recipientsRepo = process.env.SENDGRID_RECIPIENTS_REPO || 'nodejs/email';

const subject = process.env.SENDGRID_SUBJECT || 'Downtime Alert';

const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'ci-alert@iojs.org';
const fromName = process.env.SENDGRID_FROM_NAME || pkg.name;

const signature = process.env.SENDGRID_SIGNATURE || 'Node.JS Build Working Group';

module.exports.notify = function sendgridNotify(nodes, callback) {
  async.each(recipients, (recipient, cb) => {
    const email = new module.exports.sendgrid.Email();

    email.addTo(recipient);
    email.setFrom(fromEmail);
    email.setFromName(fromName);

    email.setSubject(`[${pkg.name}] ${subject}`);
    email.setText(readFileSync('./assets/email_notification.txt'));
    // email.setHtml(require('fs').readFileSync('./assets/email_notification.txt'));

    email.addSubstitution('%jenkins_summary%', jenkins.summary(nodes));
    email.addSubstitution('%jenkins_nodes%', nodes.map(node =>
      ` * ${node.offline ? 'Offline' : 'Online'} - ${node.name}`
    ).join('<br>'));
    email.addSubstitution('%jenkins_url%', `${process.env.JENKINS_URL}/computer/`);
    email.addSubstitution('%program_name%', pkg.name);
    email.addSubstitution('%email_repo%', recipientsRepo);
    email.addSubstitution('%signature%', signature);

    email.addHeader('X-Sent-Using', `${pkg.name}/${pkg.version}`);
    email.addHeader('X-Transport', 'web');

    module.exports.sendgrid.send(email, cb);
  }, callback);
};

'use strict';

const username = process.env.SENDGRID_USERNAME;
const password = process.env.SENDGRID_PASSWORD;

module.exports.sendgrid = require('sendgrid')(username, password);
const pkg = require('../package.json');
const async = require('async');
const readFileSync = require('fs').readFileSync;

const emails = process.env.SENDGRID_RECIPIENTS.split(',');

module.exports.notify = function sendgridNotify(nodes, callback) {
  async.each(emails, (recipient, cb) => {
    const email = new module.exports.sendgrid.Email();

    email.addTo(recipient);
    email.setFrom(process.env.SENDGRID_SENDER);
    email.setFromName(pkg.name);

    email.setSubject(`[${pkg.name}] Downtime Alert`);
    email.setText(readFileSync('./assets/email_notification.txt'));
    // email.setHtml(require('fs').readFileSync('./assets/email_notification.txt'));

    email.addSubstitution('%to_name%', 'you');
    email.addSubstitution('%program_name%', pkg.name);
    email.addSubstitution('%jenkins_nodes%', nodes.map(node =>
      ` * ${node.offline ? 'Offline' : 'Online'} - ${node.name}`
    ).join('<br>'));
    email.addSubstitution('%jenkins_url%', `${process.env.JENKINS_URL}/computer/`);
    email.addSubstitution('%from_name%', 'Node.JS Build Working Group');

    email.addHeader('X-Sent-Using', `${pkg.name}/${pkg.version}`);
    email.addHeader('X-Transport', 'web');

    module.exports.sendgrid.send(email, cb);
  }, callback);
};

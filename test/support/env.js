'use strict';

process.env.NODE_ENV = 'testing';
process.env.OFFLINE_THRESH = '3';
process.env.SENDGRID_RECIPIENTS = 'foo@example.com,bar@example.com';
process.env.SENDGRID_FROM_EMAIL = 'jenkins-monitor@example.com';

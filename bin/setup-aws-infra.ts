#!/usr/bin/env node
import 'source-map-support/register';
import {createStack} from '../lib/setup-aws';
import cdk = require('@aws-cdk/core');

const app = new cdk.App();
createStack(app, 'fh-campus-master-cdk-stack');

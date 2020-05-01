#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkInfraStack } from '../lib/aws-cdk-infra-stack';

const app = new cdk.App();
new AwsCdkInfraStack(app, 'AwsCdkInfraStack');

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SubwaySoundsStack } from './lib/subway-sounds-stack';

const app = new cdk.App();

new SubwaySoundsStack(app, 'SubwaySoundsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Subway Sounds NYC - Real-time 3D Subway Map Application',
  tags: {
    Project: 'SubwaySounds',
    Environment: 'production',
    Component: 'website',
  },
});
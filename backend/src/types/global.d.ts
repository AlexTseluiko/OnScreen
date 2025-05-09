/* eslint-disable no-var */
import { Server } from 'http';

declare global {
  var server: Server | undefined;
}

export {};

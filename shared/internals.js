/* global Internals:true*/
import {Mongo} from 'meteor/mongo';

/***
 * Internal namespace used for constants and collection instance
 *
 * @namespace
 * @type {{constants: {MAX_TIMESTAMP_AGE: number}, collection: Mongo.Collection}}
 */
export const Internals = {
  constants: {
    MAX_TIMESTAMP_AGE: 2500
  },
  collection: new Mongo.Collection('servermessages')
};

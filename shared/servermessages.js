import {Meteor} from 'meteor/meteor'
import {Internals} from "./internals";
import {ChannelListener} from "../client/channelListener";


export class ServerMessages {
  constructor(name) {
    this._name = name || 'default';
    if (Meteor.isClient) {
      this._listeners = {};
      this._subscription = Meteor.subscribe('ServerMessages/publishMessages', this._name);
    }
  }

  /***
   * Listen to a certain channel, execute the given handler when a message arrives
   *
   * @param channel the channel to listen to
   * @param handler the handler to execute upon a new message
   */
  listen(channel, handler) {
    if (Meteor.isServer) return;
    if (!this._listeners[channel]) {
      this._addChannelListener(channel);
    }
    this._listeners[channel].addHandler(handler);
  }

  /***
   * Instantiates a new ChannelListener for the given channel
   * @param channel the channel to listen to
   * @private
   */
  _addChannelListener(channel) {
    if (Meteor.isServer) return;
    this._listeners[channel] = new ChannelListener(
      channel,
      Internals.collection
    );
  }

  /***
   * Cleans up current subscription and oberves on the collection.
   * Call this before setting the reference to ServerMessages to undefined to prevent memory leaks.
   */
  destroy() {
    if (Meteor.isServer) return;
    _.invoke(this._listeners, 'destroy');
    this._subscription.stop();
  }

  /***
   * Notifies the listeners of the given channel.
   * All other arguments are passed on to the listeners
   *
   * @param channel the channel to notify
   */
  notify(channel) {
    if (Meteor.isClient) return;
    const args = [].slice.call(arguments);
    args.splice(0, 1);

    this._cleanupOldMessages();

    Internals.collection.insert({
      instanceName: this._name,
      channel: channel,
      user:'*',
      arguments: args,
      timestamp: (new Date().getTime())
    });
  }

  /***
   * Notifies specific listener of the given channel.
   * All other arguments are passed on to the listeners
   *
   * @param channel the channel to notify
   * @param userQuery the user to notify
   */
  notifyUser(channel, userQuery) {
    console.log(`ServerMessages.notifyUser`)
    if (Meteor.isClient) return;
    const user = Meteor.users.findOne(userQuery);
    if(!user)return;
    const args = [].slice.call(arguments);
    args.splice(0, 2);

    this._cleanupOldMessages();

    Internals.collection.insert({
      instanceName: this._name,
      channel: channel,
      user:user._id,
      arguments: args,
      timestamp: (new Date().getTime())
    });
  }

  /***
   * Cleans up old messages that are expired
   * @private
   */
  _cleanupOldMessages() {
    if (Meteor.isClient) return;
    const timestamp = (new Date().getTime()) - Internals.constants.MAX_TIMESTAMP_AGE;
    Internals.collection.remove({
      timestamp: {$lt: timestamp}
    });
  }
}

export const serverMessages = new ServerMessages();

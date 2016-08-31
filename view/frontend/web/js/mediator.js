/**
 * Copyright 2016 Resurs Bank AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(['jquery'], function ($) {
    var $this = {};

    /**
     * An object which holds all registered events and their callbacks. A callback will be stored like this:
     * listeners[event] = [{callback, identifier}]
     *
     * @type {Object}
     */
    $this.listeners = {};

    /**
     * Used to register events.
     *
     * @param {Object} obj An object with the event, an identifier and a callback.
     * @param {String} obj.event The name of the event.
     * @param {Function} obj.callback The callback for the event. It can take one argument of any value that
     * will be passed to it when fired with MEDIATOR.broadcast().
     * @param {*} obj.identifier An identifier of any value, but should be kept unique to whatever registered
     * the event. This is primarily used when removing events. Because several different objects can listen to
     * the same event, it is important that they can only remove the events they registered themselves. One good
     * way of keeping this value unique is to set it as an object, as they will always be unique.
     * @returns {Object} $this.
     */
    $this.listen = function (obj) {
        if (typeof obj.event === 'string' &&
            typeof obj.callback === 'function' &&
            obj.hasOwnProperty('identifier')) {
            if (!$this.listeners.hasOwnProperty(obj.event)) {
                $this.listeners[obj.event] = [];
            }

            $this.listeners[obj.event].push({
                callback: obj.callback,
                identifier: obj.identifier
            });
        }

        return $this;
    };

    /**
     * Broadcasts an event and passes an optional argument to the registered callbacks.
     *
     * @param {String} ev The name of the event to broadcast
     * @param {*} [arg] An optional argument to pass to the callbacks.
     * @returns {Object} $this.
     */
    $this.broadcast = function (ev, arg) {
        var listenerArr = $this.listeners[ev];

        if (listenerArr) {
            $.each(listenerArr, function (i, eventObj) {
                eventObj.callback(arg);
            });
        }

        return $this;
    };

    /**
     * Removes callbacks from registered events.
     *
     * @param {Object} obj
     * @param {String} obj.event The name of the event.
     * @param {Function} [obj.callback] Optional. A callback that was registered to the event.
     * @param {*} obj.identifier The identifier used to register the callback to the event.
     * @returns {Object} $this.
     */
    $this.ignore = function (obj) {
        var i, eventObj;
        var listenerArr = $this.listeners[obj.event];

        if (listenerArr) {
            for (i = 0; i < listenerArr.length; ++i) {
                eventObj = listenerArr[i];

                if (eventObj.identifier === obj.identifier) {
                    if (typeof obj.callback !== 'function') {
                        listenerArr.splice(i, 1);
                        i -= 1;
                    }
                    else if (obj.callback === eventObj.callback) {
                        listenerArr.splice(i, 1);
                        i -= 1;
                    }
                }
            }
        }

        return $this;
    };

    return $this;
});

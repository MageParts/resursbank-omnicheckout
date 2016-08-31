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
    var $this = {
        chains: {}
    };

    /**
     *
     * @returns {Object} An ajaxChain instance.
     */
    var ajaxChain = function () {
        var $this = {};
        var running = false;
        var ongoingCall = null;

        /**
         * The "complete" callback for AJAX calls. Their callback gets replaced with this one but the original gets
         * fired inside of it.
         *
         * @param callObj
         * @returns {Function}
         */
        var onCallComplete = function (callObj) {
            var completeCallback = callObj.complete;

            return function () {
                var nextCall;

                if (typeof completeCallback === 'function') {
                    completeCallback();
                }

                $this.deleteCall(callObj.name);

                ongoingCall = null;

                if (running && $this.calls.queue.length > 0) {
                    nextCall = $this.calls.queue.shift();
                    nextCall.complete = onCallComplete(nextCall);
                    $this.call(nextCall);
                }
                else if ($this.calls.queue.length === 0) {
                    $this.stop();
                }
            };
        };

        /**
         * The queued calls.
         *
         * @type {Array}
         */
        $this.calls = {
            queue: []
        };

        /**
         * The name of the chain.
         *
         * @type {String}
         */
        $this.name = '';

        /**
         * Stops the queue from running.
         *
         * @returns {Object} $this.
         */
        $this.stop = function () {
            running = false;

            return $this;
        };

        /**
         * Returns the call object with the specified callName. If an object can't be found, or the argument is missing,
         * it will return null.
         *
         * @param {String} callName
         * @return {Object|Null}
         */
        $this.getCall = function (callName) {
            return typeof callName === 'string' && $this.calls.hasOwnProperty(callName) ? $this.calls[callName] : null;
        };

        /**
         * Runs through the entire chain of calls.
         *
         * @return {Object} $this.
         */
        $this.run = function () {
            var nextCall;

            if ($this.calls.queue.length > 0 && !running) {
                running = true;
                nextCall = $this.calls.queue.shift();
                nextCall.complete = onCallComplete(nextCall);

                $this.call(nextCall);
            }

            return $this;
        };

        /**
         * Queues an AJAX call.
         *
         * @param {Object} obj
         * @param {String} obj.url - The URL to send the message to.
         * @param {Object} [obj.data] - An object with data to send with the call.
         * @param {Function} [obj.success] - A callback when the AJAX call has been successful.
         * @param {Function} [obj.failure] - A callback when the AJAX call has failed.
         * @param {Function} [obj.complete] - A callback when the AJAX call has completed.
         * @return {Object} $this.
         */
        $this.queue = function (obj) {
            if (obj.hasOwnProperty('url') && typeof obj.url === 'string') {
                if (obj.hasOwnProperty('name') && typeof obj.name === 'string') {
                    $this.saveCall(obj);
                }

                $this.calls.queue.push(obj);
            }

            return $this;
        };

        /**
         * Makes an AJAX call.
         *
         * @param {Object} callObj - The AJAX request. This object can hold any information relevant to the call.
         * @param {String} callObj.url - Where the call should be pointed to.
         * @param {*} [callObj.data] - Data that should be sent with the call.
         * @param {Function} [callObj.success] - A callback when the AJAX call has been successful.
         * @param {Function} [callObj.error] - A callback when the AJAX call has failed.
         * @param {Function} [callObj.complete] - A callback when the AJAX call has completed.
         * @returns {Object} $this.
         */
        $this.call = function (callObj) {
            if (ongoingCall === null) {
                ongoingCall = {
                    call: callObj,
                    xhr: $.ajax(callObj.url, callObj)
                };
            }

            return $this;
        };

        /**
         * Saves the call object for future use.
         *
         * @param {Object} callObj
         * @returns {Object} $this.
         */
        $this.saveCall = function (callObj) {
            if ($this.calls.hasOwnProperty(callObj.name)) {
                throw Error('ajaxChain saveCall(): The name [' + callObj.name + '] already exists in this chain.');
            }

            $this.calls[callObj.name] = callObj;

            return $this;
        };

        /**
         * Removes a saved call.
         *
         * @param callName
         * @returns {Object} $this.
         */
        $this.deleteCall = function (callName) {
            if ($this.calls.hasOwnProperty(callName)) {
                delete $this.calls[callName];
            }

            return $this;
        };

        /**
         * Returns the running state of the chain.
         *
         * @returns {Boolean}
         */
        $this.isRunning = function () {
            return running;
        };

        /**
         * Destroys the AJAX-chain instance.
         */
        $this.destroy = function () {
            var i;

            running = null;
            ongoingCall = null;

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        return $this;
    };

    /**
     * Creates a chain. A chain is a queue that you can add calls to.
     *
     * @param {String} name - The name of the chain.
     * @returns {Object} $this.
     */
    $this.createChain = function (name) {
        if ($this.chains.hasOwnProperty(name)) {
            throw Error('AJAX createChain(): Chain [' + name + '] is already created.');
        }

        $this.chains[name] = ajaxChain({
            name: name
        });

        return $this;
    };

    /**
     * Removes a chain.
     *
     * @param {String} name
     * @returns {Object} $this.
     */
    $this.removeChain = function (name) {
        var chain;

        if (name === 'global') {
            throw Error('Toolbox [AJAX] removeChain(): The chain [global] may not be removed.');
        }

        chain = $this.chains[name];

        if (chain) {
            chain.destroy();

            delete $this.chains[name];
        }

        return $this;
    };

    /**
     * Returns a chain with the given name, the global chain if getGlobal is truthy and a chain can't be found, or
     * null if a chain can't be found at all.
     *
     * @param {String} name - The name of the chain.
     * @param {Boolean} [getGlobal] - Optional. If true, and if a chain with the given name can't be found, it will
     * return the global chain.
     * @returns {null|Object} - Null, if a chain can't be found, or either the chain with the given name or the
     * global chain depending on the value of the getGlobal argument.
     */
    $this.getChain = function (name, getGlobal) {
        var chain = $this.chains[name];

        if (getGlobal && !chain) {
            chain = $this.chains.global;
        }

        return chain ? chain : null;
    };

    /**
     * Queues an AJAX call.
     *
     * @param {Object} obj
     * @param {String} obj.url - The URL to send the message to.
     * @param {String} [obj.name] - The name of the call. This can be used later to perform actions on it.
     * @param {String} [obj.chain] - The queue to add to the call to. If not specified, the call will be put in the
     * default queue.
     * @param {Object} [obj.data] - An object with data to send with the call.
     * @param {Function} [obj.success] - A callback when the AJAX call has been successful.
     * @param {Function} [obj.failure] - A callback when the AJAX call has failed.
     * @param {Function} [obj.complete] - A callback when the AJAX call has completed.
     * @return {Object} $this.
     */
    $this.queue = function (obj) {
        var chain;

        if (obj.hasOwnProperty('url') && typeof obj.url === 'string') {
            if (obj.hasOwnProperty('chain') && typeof obj.chain === 'string') {
                chain = obj.chain;

                if (!$this.chains.hasOwnProperty(chain)) {
                    throw Error('AJAX queue(): Chain [' + chain + '] does not exist.');
                }

                delete obj.chain;

                $this.chains[chain].queue(obj);
            }
            else {
                $this.chains.global.queue(obj);
            }
        }

        return $this;
    };

    /**
     * Runs through an entire chain of calls.
     *
     * @param {String} chainName
     * @return {Object} $this.
     */
    $this.run = function (chainName) {
        var chain = $this.getChain(chainName);

        if (chain && !chain.isRunning()) {
            chain.run();
        }

        return $this;
    };

    /**
     * Returns the call object with the specified chainName and callName. If an object can't be found, or one of the
     * arguments are missing, it will return null.
     *
     * @param {String} chainName
     * @param {String} callName
     * @return {Object|Null}
     */
    $this.getCall = function (chainName, callName) {
        var call = null;
        var chain = null;

        if (typeof chainName === 'string' && typeof callName === 'string') {
            chain = $this.chains[chainName];

            if (chain) {
                call = chain.getCall(callName);
            }
        }

        return call;
    };

    // Creating the global chain.
    $this.createChain('global');

    return $this;
});

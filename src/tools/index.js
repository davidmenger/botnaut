/*
 * @author David Menger
 */
'use strict';

const bufferloader = require('./bufferloader');
const MemoryStateStorage = require('./MemoryStateStorage');
const Settings = require('./Settings');
const Translate = require('./Translate');
const UserLoader = require('./UserLoader');
const { senderFactory, sender } = require('./senderFactory');
const { azureSenderFactory, azureSender } = require('./azureSenderFactory');
const { returnSenderFactory } = require('./returnSenderFactory');

module.exports = {
    bufferloader,
    UserLoader,
    Translate,
    Settings,
    MemoryStateStorage,
    senderFactory,
    azureSenderFactory,
    sender,
    azureSender,
    returnSenderFactory
};

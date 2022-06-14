'use strict';

const messageParser = (input) => {
    // THIS FUNCTION IS NOT YET OPTIMIZED FOR PERFORMANCE. IT IS ONLY MADE AS A TEMPORARY SOLUTION.
    if (!input) {
        throw new Error('requestBody is required');
    }

    //first check if the message is a whatsapp message
    if (!input.object || input.object !== 'whatsapp_business_account') {
        throw new Error(
            'requestBody is not a valid whatsapp message. Hint: check the "object" property'
        );
    }

    if (!input.entry || !input.entry?.length) {
        throw new Error(
            'requestBody is not a valid whatsapp message. Hint: check the "entry" property'
        );
    }

    if (
        !input.entry[0].changes?.length ||
        input.entry[0].changes[0].field !== 'messages'
    ) {
        throw new Error(
            'requestBody is not a valid whatsapp message. Hint: check the "changes" property'
        );
    }

    let metadata = input.entry[0].changes[0].value.metadata;
    let contacts = input.entry[0].changes[0].value.contacts?.length
        ? input.entry[0].changes[0].value.contacts[0]
        : null;
    let message = input.entry[0].changes[0].value?.messages?.length
        ? input.entry[0].changes[0].value.messages[0]
        : null;

    let actualType;
    if (message?.type) {
        actualType = message.type;
    } else {
        if (message?.location) {
            actualType = 'location';
        } else if (message?.contacts) {
            actualType = 'contact';
        }
    }

    let isNotificationMessage;
    if (input.entry[0].changes[0].value.statuses?.length) {
        isNotificationMessage = true;
    } else {
        if (actualType === 'unsupported' && message.errors?.length) {
            isNotificationMessage = true;
        } else {
            isNotificationMessage = false;
        }
    }

    let WABA_ID = input.entry[0].id;

    let finalType;
    if (actualType === 'text' && message.referral) {
        finalType = 'adMessage';
    } else if (actualType === 'text') {
        finalType = 'textMessage';
    } else if (actualType === 'sticker') {
        finalType = 'stickerMessage';
    } else if (actualType === 'image') {
        finalType = 'mediaMessage';
    } else if (actualType === 'location') {
        finalType = 'locationMessage';
    } else if (actualType === 'contact') {
        finalType = 'contactMessage';
    } else if (actualType === 'button') {
        finalType = 'quickReplyMessage';
    } else if (
        actualType === 'interactive' &&
        message.interactive.type === 'list_reply'
    ) {
        finalType = 'listMessage';
    } else if (
        actualType === 'interactive' &&
        message.interactive.type === 'button_reply'
    ) {
        finalType = 'replyButtonMessage';
    } else if (actualType === 'unsupported') {
        finalType = 'unknownMessage';
    }

    let output = {
        WABA_ID,
        isNotificationMessage,
        actualType,
        finalType,
        metadata,
        contacts,
        message,
    };

    return output;
}; 

module.exports = messageParser;
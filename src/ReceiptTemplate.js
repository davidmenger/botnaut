/*
 * @author David Menger
 */
'use strict';

const BaseTemplate = require('./BaseTemplate');

/**
 * Provides fluent interface to make nice Receipts
 * Instance of button template is returned by {Responder}
 *
 * @class ReceiptTemplate
 * @extends {BaseTemplate}
 */
class ReceiptTemplate extends BaseTemplate {

    constructor (onDone, context, recipientName, paymentMethod = 'Cash', currency = 'USD', uniqueCode = null) {
        super(onDone, context);

        this.recipientName = recipientName;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.totalCost = 0;
        this.elements = [];
        this.uniqueCode = uniqueCode;
    }

    /**
     * Adds item to receipt
     *
     * @param {string} title
     * @param {number} [price=0] a item price
     * @param {number} [quantity=null] amount of items
     * @param {string} [image=null] image of item
     * @param {string} [subtitle=null] optional subtitle
     * @returns {this}
     *
     * @memberOf ReceiptTemplate
     */
    addElement (title, price = 0, quantity = null, image = null, subtitle = null) {
        const element = {
            title: this._t(title),
            price
        };

        this.totalCost += price;

        if (quantity !== null) {
            element.quantity = quantity;
        }
        if (image !== null) {
            element.image = this._imageUrl(image);
        }
        if (subtitle !== null) {
            element.subtitle = this._t(subtitle);
        }
        this.elements.push(element);
        return this;
    }

    getTemplate () {
        const ret = {
            template_type: 'receipt',
            recipient_name: this.recipientName,
            currency: this.currency,
            payment_method: this.paymentMethod,
            elements: this.elements,
            order_number: this.uniqueCode || `${Math.random() * 1000}${Date.now()}`,
            // @todo create order number somehow
            summary: {
                total_cost: this.totalCost
            }
        };
        return ret;
    }

}

module.exports = ReceiptTemplate;

/*
 * @author David Menger
 */
'use strict';

const BaseTemplate = require('./BaseTemplate');

class ReceiptTemplate extends BaseTemplate {

    constructor (onDone, context, translator, recipientName, paymentMethod = 'Cash', currency = 'USD', uniqueCode = null) {
        super(onDone, context, translator);

        this.recipientName = recipientName;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.totalCost = 0;
        this.elements = [];
        this.uniqueCode = uniqueCode;
    }

    addElement (title, price = 0, quantity = null, image = null, subtitle = null) {
        const element = {
            title: this.translator(title),
            price
        };

        this.totalCost += price;

        if (quantity !== null) {
            element.quantity = quantity;
        }
        if (image !== null) {
            element.image = image.match(/^https?:/)
                ? image
                : `${this.context.appUrl}${image}`;
        }
        if (subtitle !== null) {
            element.subtitle = this.translator(subtitle);
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

import { Injectable } from "@angular/core";

/**
 * @returns If true, delegate will be removed from the stack after execution.
 */
type EscKeyDelegate = () => boolean | void;

export class EscKeySubscription {
    
    constructor(private service: EscKeyScopeService, public delegate: EscKeyDelegate) {
    }

    unsubscribe() {
        this.service.unsubscribe(this);
    }
}

/**
 * Service that keeps track of ESC key subscriptions. Last subscription receives
 * the key press event. After latest subscription is unsubscribed previos 
 * subscription will receive ESC key press events.
 * 
 * Subscription can be unsubscribed by explicily calling unsubscribe() method or
 * by returning true from EscKeyDelegate.
 */
@Injectable({
    providedIn: 'root',
})
export class EscKeyScopeService {

    private stack: EscKeySubscription[] = [];

    /**
     * Subscribes new ESC delegate as the top delegate.
     * 
     * @param delegate Delegate that will be executed on ESC key press
     * @returns Subscription object that can be used to unsubscribe the delegate.
     */
    public subscribe(delegate: EscKeyDelegate) {
        const subscription = new EscKeySubscription(this, delegate);
        
        this.stack.push(subscription);

        return subscription;
    }

    /**
     * Removes ESC key subscription.
     * 
     * @param subscription Subscription to be removed
     */
    public unsubscribe(subscription: EscKeySubscription) {
        const index = this.stack.indexOf(subscription);

        if (index !== undefined) {
            this.stack.splice(index, 1);
        }
    }

    /** Executes EscKey delegate at the top of the stack. */
    public execute() {
        if (this.stack.length > 0) {
            const ret = this.stack[this.stack.length - 1].delegate();

            if (ret) {
                this.stack.pop();
            }
        }
        
    }

}
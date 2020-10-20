module.exports = class Subscription {
    constructor (handler, { id, data }) {

        this.id = id;

        this.handler = handler;
        this.handler.subscriptionCache.set(this.id, this);

        // Expiration date
        this.expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null;
        // Subscription label
        this.label = data.sub_label;
        // Whether this subscription is invalidated
        this.invalidated = data.sub_invalidated || false;
    }

    get aboutToExpire () {
        return this.active && (this.expiresAtCalculated - Date.now() < (3*24*60*60*1000));
    }

    get expiresAtCalculated () {
        return this.isTrial ? this.expiresAt : (this.expiresAt + (7*24*60*60*1000));
    }

    get active () {
        return !this.invalidated && this.expiresAtCalculated > Date.now();
    }

    get isTrial () {
        return this.label === "Trial Version";
    }

    async isPayPalSubscription () {
        if (this.label !== "Premium Monthly 1 Guild") return {
            isPayPalSubscription: false,
            isCancelled: true
        };
        const payments = await this.handler.getPaymentsForSubscription(this.id);
        console.log( {
            isPayPalSubscription: payments.some((p) => p.type.startsWith("paypal_dash_signup")),
            isCancelled: 
                payments.filter((p) => p.type.startsWith("paypal_dash_signup")).length <= payments.filter((p) => p.type.startsWith("paypal_dash_cancel")).length
                || this.invalidated
        });
        return {
            isPayPalSubscription: payments.some((p) => p.type.startsWith("paypal_dash_signup")),
            isCancelled: 
                payments.filter((p) => p.type.startsWith("paypal_dash_signup")).length <= payments.filter((p) => p.type.startsWith("paypal_dash_cancel")).length
                || this.invalidated
        };
    }

    async invalidate () {
        this.invalidated = true;
        await this.handler.query(`
            UPDATE subscriptions
            SET sub_invalidated = true
            WHERE id = ${this.id};
        `);
        this.handler.syncSubscriptionForOtherCaches(this.id);
    }

    async addDays (count){
        const ms = count*24*60*60*1000;
        if (this.expiresAt >= Date.now()){
            this.expiresAt += ms;
        } else {
            this.expiresAt = Date.now() + ms;
        }
        await this.handler.query(`
            UPDATE subscriptions
            SET expires_at = '${new Date(this.expiresAt).toISOString()}'
            WHERE id = ${this.id};
        `);
        this.handler.syncSubscriptionForOtherCaches(this.id);
    }

    async deleteGuildsFromCache (){
        const { rows } = await this.handler.query(`
            SELECT * FROM guilds_subscriptions
            WHERE sub_id = ${this.id};
        `);
        for (const row of rows) {
            this.handler.guildCache.delete(row.guild_id);
            this.handler.removeGuildFromOtherCaches(row.guild_id);
        }
    }

};
(function () {

    function UTCClock (offset) {
        this.offset = offset || 0;
        this.now = {

            // get the current utc timestamp in milliseconds with new UTCClock().now.ms
            ms: function () {
                var n = new Date;
                return this.offset + Date.UTC(
                        n.getUTCFullYear(),
                        n.getUTCMonth(),
                        n.getUTCDate() ,
                        n.getUTCHours(),
                        n.getUTCMinutes(),
                        n.getUTCSeconds(),
                        n.getUTCMilliseconds());
            }.bind(this),

            // get the current utc timestamp formatted as ISO string with new UTCClock().now.iso
            iso: function () {
                return new Date(Date.now() + this.offset).toISOString();
            }.bind(this)

        };
    }

    //export to either amd/requirejs or node

    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = UTCClock;

    } else if (typeof define === "function" && define.amd) {
        define(function () {
            return UTCClock;
        });
    }

})();

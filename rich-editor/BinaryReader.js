function BinaryReader(arrayBuffer)
{
    assert(arrayBuffer instanceof ArrayBuffer);
    this.pos = 0;
    this.data = new Uint8Array(arrayBuffer);
}

BinaryReader.prototype = {
    seek: function(pos) {
        assert(pos >=0 && pos <= this.data.length);
        var oldPos = this.pos;
        this.pos = pos;
        return oldPos;
    },

    tell: function() {
        return this.pos;
    },

    getUint8: function() {
        assert(this.pos < this.data.length);
        return this.data[this.pos++];
    },

    getUint16: function() {
        return ((this.getUint8() << 8) | this.getUint8()) >>> 0;
    },

    getUint32: function() {
       return this.getInt32() >>> 0;
    },

    getInt16: function() {
        var result = this.getUint16();
        if (result & 0x8000) {
            result -= (1 << 16);
        }
        return result;
    }, 

    getInt32: function() {
        return ((this.getUint8() << 24) | 
                (this.getUint8() << 16) |
                (this.getUint8() <<  8) |
                (this.getUint8()      ));
    }, 

    getFword: function() {
        return this.getInt16();
    },

    get2Dot14: function() {
        return this.getInt16() / (1 << 14);
    },

    getFixed: function() {
        return this.getInt32() / (1 << 16);
    },

    getString: function(length) {
        var result = "";
        for(var i = 0; i < length; i++) {
            result += String.fromCharCode(this.getUint8());
        }
        return result;
    },

    getDate: function() {
        var macTime = this.getUint32() * 0x100000000 + this.getUint32();
        var utcTime = macTime * 1000 + Date.UTC(1904, 1, 1);
        return new Date(utcTime);
    }
};

export {BinaryReader};
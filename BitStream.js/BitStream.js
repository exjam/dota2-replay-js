(function(global) {
    var BitStream = function(byteBuffer)
    {
        this.bitOffset = 0;
        this.byteBuffer = byteBuffer;
    };

    BitStream.BitMask = [ 0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff ];

    BitStream.prototype.readString = function(max)
    {
        var result = "";
        var chr = 1;

        max = typeof max !== 'undefined' ? max : 128;

        for (var i = 0; i < max && chr; ++i) {
            if (chr = this.readBitNumber(8)) {
                result += String.fromCharCode(chr);
            }
        }

        return result;
    };

    BitStream.prototype.readBits = function(bits)
    {
        var bytes = Math.ceil(bits / 8);
        var result = new dcodeIO.ByteBuffer(bytes);
        result.length = bytes;

        while (bits > 0) {
            var read = Math.min(bits, 8);
            result.writeUint8(this.readBitNumber(read));
            bits -= read;
        }

        result.offset = 0;
        return result;
    };

    BitStream.prototype.readBit = function()
    {
        return this.readBitNumber(1);
    };

    BitStream.prototype.readBitNumber = function(bits)
    {
        var value = 0;
        var read = 0;

        while (bits > 0) {
            var byte = this.byteBuffer.readUint8(this.byteBuffer.offset);
            var count = Math.min(bits, 8 - this.bitOffset);

            value = value | ((byte >> this.bitOffset) & BitStream.BitMask[count]) << read;
            this.bitOffset += count;
            bits -= count;
            read += count;

            if (this.bitOffset == 8) {
                this.bitOffset = 0;
                this.byteBuffer.offset += 1;
            }
        }

        return value;
    };

    BitStream.prototype.readVarInt = function()
    {
        var value = 0;
        var byte = 0;
        var shift = 0;

        do {
            byte = this.readBitNumber(8);
            value |= (byte & 0x7F) << shift;
            shift += 7;
        } while (byte & 0x80 && shift < 35);

        return value;
    };

    global["BitStream"] = BitStream;
})(this);

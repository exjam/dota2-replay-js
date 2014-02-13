
(function(global) {
    var Snappy = function() {
    };

    Snappy.uncompressed_length = function(byteBuffer)
    {
        return byteBuffer.readVarint(byteBuffer.offset);
    };

    Snappy.uncompress = function(byteBuffer) 
    {
        var input  = byteBuffer.clone();
        var start = input.offset;
        var size = input.readVarint();
        var output = new ByteBuffer(size);

        output.offset = 0;
        output.length = size;
        input.littleEndian = true;

        var copy = function(output, length, offset) {
            var ptr = output.offset - offset;

            if (ptr < 0) {
                throw new Error('offset > this.output')
            }

            for(var i = 0; i < length; ++i) {
                output.writeByte(output.readByte(ptr + i));
            }
        };

        while(input.remaining()) {
            var tag = input.readUint8();

            switch (tag & 3) {
            case 0:
                var length = (tag >> 2) + 1;

                if (length >= 61) {
                    var bytes = length - 60;
                    length = 0;

                    for (var i = 0; i < bytes; ++i) {
                        length |= input.readUint8() << (8 * i);
                    }

                    length++;
                }

                for (var i = 0; i < length; ++i) {
                    output.writeByte(input.readByte());
                }

                break;

            case 1:
                var length = ((tag >> 2) & 7) + 4;
                var offset = ((tag >> 5) << 8) | input.readUint8();

                copy(output, length, offset);
                break;

            case 2:
                var length = (tag >> 2) + 1;
                var offset = input.readUint16();

                copy(output, length, offset);
                break;

            case 3:
                var length = (tag >> 2) + 1;
                var offset = input.readUint32();

                copy(output, length, offset);
                break;
            };
        }

        output.offset = 0;
        return output;
    };

    global["Snappy"] = Snappy;
})(this);

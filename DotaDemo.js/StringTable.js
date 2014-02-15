(function(global) {
    var StringTable = function(msg)
    {
        this.name = msg.name;
        this.max_entries = msg.max_entries;
        this.user_data_fixed_size = msg.user_data_fixed_size;
        this.user_data_size = msg.user_data_size;
        this.user_data_size_bits = msg.user_data_size_bits;
        this.string_data = { };
    };

    StringTable.prototype.MAX_KEY_LENGTH = 0x400;
    StringTable.prototype.MAX_KEYS = 32;

    StringTable.prototype.readStream = function(entries, stream)
    {
        var keys = [];
        var index = -1;
        var unk1 = stream.readBitNumber(1);

        for (var i = 0; i < entries; ++i) {
            var entry = { };

            index = this.readIndex(index, stream);
            entry.key = this.readKey(stream, keys, unk1);
            entry.value = this.readValue(stream);

            if (index < this.max_entries) {
                if (index in this.string_data) {
                    if (this.string_data[index].key != entry.key) {
                        throw(new Error("StringTable mismatching keys at index " + index + " '" + entry.key + "'' != '" + this.string_data[index].key) + "'");
                    }

                    this.string_data[index].value = entry.value;
                } else {
                    this.string_data[index] = entry;
                }
            } else if (!entry.key) {
                throw(new Error("StringTable requires key when index is bad"));
            }

            if (entry.key) {
                this.string_data["_" + entry.key] = entry;
            }
        }
    };

    StringTable.prototype.readIndex = function(index, stream)
    {
        if (stream.readBitNumber(1)) {
            return index + 1;
        } else {
            return stream.readBitNumber(Math.ceil(Math.log2(this.max_entries)));
        }
    };

    StringTable.prototype.readKey = function(stream, keys, unkFlag)
    {
        var key;

        if (stream.readBitNumber(1)) {
            if (unkFlag) {
                var unk1 = stream.readBitNumber(1);

                if (unk1) {
                    throw(new Error("Unknown StringTable key format"));
                }
            }

            if (stream.readBitNumber(1)) {
                var id = stream.readBitNumber(5);
                var len = stream.readBitNumber(5);

                key = keys[id].slice(0, len);
                key += stream.readString(StringTable.MAX_KEY_LENGTH);
            } else {
                key = stream.readString(StringTable.MAX_KEY_LENGTH);
            }

            if (keys.length > StringTable.MAX_KEYS) {
                keys.shift();
            }

            keys.push(key);
        }

        return key;
    };

    StringTable.prototype.readValue = function(stream)
    {
        var value;

        if (stream.readBitNumber(1)) {
            var len;

            if (this.user_data_fixed_size) {
                len = this.user_data_size_bits;
            } else {
                len = stream.readBitNumber(14) * 8;
            }

            value = stream.readBits(len);
        }

        return value;
    };

    if (!global["dota"]) { global["dota"] = { }; }
    global["dota"]["StringTable"] = StringTable;
})(this);

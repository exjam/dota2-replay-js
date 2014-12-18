(function(global) {
    var DotaDemo = function()
    {
        this.entities = { };

        this.demoMessageListeners = { };
        this.gameMessageListeners = { };
        this.userMessageListeners = { };

        this.demoMessageIgnore = { };
        this.gameMessageIgnore = { };
        this.userMessageIgnore = { };

        this.addDemoMessageIgnore(dota.msg.DEM_SyncTick);
        this.addGameMessageIgnore(dota.msg.net_NOP);
        this.addGameMessageIgnore(dota.msg.net_Tick);

        this.addDemoMessageListener(dota.msg.DEM_ClassInfo, this.readDemoClassInfo.bind(this));
        this.addDemoMessageListener(dota.msg.DEM_StringTables, this.readDemoStringTables.bind(this));

        this.addGameMessageListener(dota.msg.svc_SendTable, this.readGameSendTable.bind(this));
        this.addGameMessageListener(dota.msg.svc_ServerInfo, this.readGameServerInfo.bind(this));
        this.addGameMessageListener(dota.msg.svc_CreateStringTable, this.readGameCreateStringTable.bind(this));
        this.addGameMessageListener(dota.msg.svc_UpdateStringTable, this.readGameUpdateStringTable.bind(this));
        this.addGameMessageListener(dota.msg.svc_UserMessage, this.readUserMessage.bind(this));
        this.addGameMessageListener(dota.msg.svc_PacketEntities, this.readPacketEntities.bind(this));
        this.addGameMessageListener(dota.msg.net_SignonState, this.readNetSignonState.bind(this));
    };

    DotaDemo.pbMessages = dcodeIO.ProtoBuf.loadProtoFile("dota2.proto");

    DotaDemo.prototype.addDemoMessageListener = function(msg, listener)
    {
        if (!(msg in this.demoMessageListeners)) {
            this.demoMessageListeners[msg] = [];
        }

        this.demoMessageListeners[msg].push(listener);
    };

    DotaDemo.prototype.addGameMessageListener = function(msg, listener)
    {
        if (!(msg in this.gameMessageListeners)) {
            this.gameMessageListeners[msg] = [];
        }

        this.gameMessageListeners[msg].push(listener);
    };

    DotaDemo.prototype.addUserMessageListener = function(msg, listener)
    {
        if (!(msg in this.userMessageListeners)) {
            this.userMessageListeners[msg] = [];
        }

        this.userMessageListeners[msg].push(listener);
    };

    DotaDemo.prototype.addDemoMessageIgnore = function(msg)
    {
        this.demoMessageIgnore[msg] = true;
    };

    DotaDemo.prototype.addGameMessageIgnore = function(msg)
    {
        this.gameMessageIgnore[msg] = true;
    };

    DotaDemo.prototype.addUserMessageIgnore = function(msg)
    {
        this.userMessageIgnore[msg] = true;
    };

    DotaDemo.prototype.read = function(byteBuffer)
    {
        var header = byteBuffer.readUTF8String(8);
        var offset = byteBuffer.readUint32();

        if (header.substring(0, 7) === "PBUFDEM") {
            throw new Error("DotaDemo.read: could not find PBUFDEM header");
        }

        var begin = byteBuffer.offset;
        var end = byteBuffer.limit;
        var n = 5000;

        for (var i = 0; i < n; ++i) {
            this.readDemoMessage(byteBuffer);
        }

        console.log(byteBuffer.offset / byteBuffer.limit);
        console.log('Read first ' + n + ' messages!');
    };

    DotaDemo.prototype.readDemoMessage = function(byteBuffer)
    {
        var kind = byteBuffer.readVarint32();
        var tick = byteBuffer.readVarint32();
        var size = byteBuffer.readVarint32();
        var comp;

        comp = ((kind & dota.msg.DEM_IsCompressed) == dota.msg.DEM_IsCompressed);
        kind &= dota.msg.DEM_Max;

        if (!(kind in this.demoMessageIgnore)) {
            if (kind in dota.msg.DemoMessages) {
                var msg = DotaDemo.pbMessages.build(dota.msg.DemoMessages[kind]);
                var buf = byteBuffer.slice(byteBuffer.offset, byteBuffer.offset + size);

                if (comp) {
                    buf = Snappy.uncompress(buf);
                }

                var decoded = msg.decode(buf);

                console.log({
                    type: dota.msg.DemoMessages[kind],
                    tick: tick,
                    message: decoded
                });

                if (kind in dota.msg.DemoMessages.isContainer) {
                    buf = decoded.data.clone();

                    while (buf.offset < buf.limit) {
                        this.readGameMessage(buf);
                    }
                } else if (kind in this.demoMessageListeners) {
                    for (var listener in this.demoMessageListeners[kind]) {
                        this.demoMessageListeners[kind][listener](decoded);
                    }
                }
            } else {
                console.log({
                    type: "Unknown DemoMessage " + kind,
                    tick: tick
                });
            }
        }

        byteBuffer.offset += size;
    };

    DotaDemo.prototype.readGameMessage = function(byteBuffer)
    {
        var kind = byteBuffer.readVarint32();
        var size = byteBuffer.readVarint32();

        if (!(kind in this.gameMessageIgnore)) {
            if (kind in dota.msg.GameMessages) {
                var msg = DotaDemo.pbMessages.build(dota.msg.GameMessages[kind]);
                var buf = byteBuffer.slice(byteBuffer.offset, byteBuffer.offset + size);
                var decoded = msg.decode(buf);

                console.log({
                    type: dota.msg.GameMessages[kind],
                    message: decoded
                });

                if (kind in this.gameMessageListeners) {
                    for (var listener in this.gameMessageListeners[kind]) {
                        this.gameMessageListeners[kind][listener](decoded);
                    }
                }
            } else {
                console.log({
                    type: "Unknown GameMessage " + kind
                });
            }
        }

        byteBuffer.offset += size;
    };

    DotaDemo.prototype.readUserMessage = function(msg)
    {
        var kind = msg.msg_type;
        var data = msg.msg_data.clone();

        if (!(kind in this.userMessageIgnore)) {
            if (kind in dota.msg.UserMessages) {
                var userMsg = DotaDemo.pbMessages.build(dota.msg.UserMessages[kind]);
                var decoded = userMsg.decode(data);

                console.log({
                    type: dota.msg.UserMessages[kind],
                    message: decoded
                });

                for (var listener in this.userMessageListeners[kind]) {
                    this.userMessageListeners[kind][listener](decoded);
                }
            } else {
                console.log({
                    type: "Unknown UserMessage " + kind
                });
            }
        }
    };

    DotaDemo.prototype.readDemoClassInfo = function(msg)
    {
        if (!this.classInfo) {
            this.classInfo = { };
        }

        for (var i = 0; i < msg.classes.length; ++i) {
            var cls = msg.classes[i];

            this.classInfo[cls.class_id] = {
                class_id:     cls.class_id,
                table_name:   cls.table_name,
                network_name: cls.network_name
            };
        }
    };

    DotaDemo.prototype.flatten = function(table)
    {
        var flattener = new dota.SendTableFlattener(this.netTables, table);
        var props = flattener.flatten();
        var priorities = [];
        priorities.push(64);

        for (var i = 0; i < props.length; ++i) {
            if (priorities.indexOf(props[i].prop.priority) === -1) {
                priorities.push(props[i].prop.priority);
            }
        }

        priorities.sort(function(a, b){ return a - b });

        var offset = 0;
        for (var i = 0; i < priorities.length; ++i) {
            var priority = priorities[i];
            var hole = offset;
            var cursor = offset;

            while (cursor < props.length) {
                var prop = props[cursor].prop;
                if (prop.priority === priority || ((prop.flags & dota.prop.Flag.ChangesOften) && priority == 64)) {
                    var tmp = props[cursor];
                    props[cursor] = props[hole];
                    props[hole] = tmp;
                    hole++;
                    offset++;
                }
                cursor++;
            }
        }

        return props;
    };

    DotaDemo.prototype.compileNetTables = function()
    {
        this.recvTables = { };

        for (var table_name in this.netTables) {
            var table = this.netTables[table_name];

            if (table.needs_decoder) {
                this.recvTables[table_name] = this.flatten(table);
            }
        }
    };

    DotaDemo.prototype.readDemoStringTables = function(msg)
    {
        for (var i = 0; i < msg.tables.length; ++i) {
            if (msg.tables[i].table_name == "userinfo") {
                for (var j = 0; j < msg.tables[i].items.length; ++j) {
                    var data = msg.tables[i].items[j].data;
                    var info = {};

                    if (data != null) {
                        data = data.clone();

                        info.xuid             = data.readUint64();
                        info.name             = data.readUTF8String(32);
                        info.userID           = data.readUint32();
                        info.guid             = data.readBytes(33);
                        info.friendsID        = data.readUint32();
                        info.friendsName      = data.readBytes(32);
                        info.fakeplayer       = data.readUint32();
                        info.ishltv           = data.readUint32();
                        info.customFiles      = data.readArray(4, function(){ return data.readUint32(); });
                        info.filesDownloaded  = data.readUint8();

                        console.log(info);
                    }
                }
            }
        }

        console.log(msg.tables);
    };

    DotaDemo.prototype.readGameServerInfo = function(msg)
    {
        this.serverInfo = msg;
    };

    DotaDemo.prototype.readGameSendTable = function(msg)
    {
        if (!this.netTables) {
            this.netTables = { };
        }

        this.netTables[msg.net_table_name] = {
            net_name: msg.net_table_name,
            needs_decoder: msg.needs_decoder,
            props: msg.props
        };

        var props = this.netTables[msg.net_table_name].props;

        for (var i = 0; i < props.length; ++i) {
            var prop = props[i];

            if (prop.type === dota.prop.Type.Array_) {
                prop.template = props[i - 1];
            }
        }
    };

    DotaDemo.prototype.readGameCreateStringTable = function(msg)
    {
        if (!this.stringTables) {
            this.stringTables = { };
            this.stringTablesID = [];
        }

        var table = new dota.StringTable(msg);
        table.readStream(msg.num_entries, new BitStream(msg.string_data));
        this.stringTables[msg.name] = table;
        this.stringTablesID.push(msg.name);
    };

    DotaDemo.prototype.readGameUpdateStringTable = function(msg)
    {
        var name = this.stringTablesID[msg.table_id];

        if (name && name in this.stringTables) {
            if (name === "ActiveModifiers") {
                return;
            }
            this.stringTables[name].readStream(msg.num_changed_entries, new BitStream(msg.string_data));
        }
    };

    function assert(condition, message) {
        if (!condition) {
            throw message || "Assertion failed";
        }
    }

    DotaDemo.prototype.readNetSignonState = function(msg)
    {
        if (msg.signon_state == 5) {
            this.compileNetTables();
        }
    };

    DotaDemo.prototype.readEntityIndex = function(stream) {
        var value = stream.readBitNumber(6);
        var extra = value >> 4;

        switch (extra) {
        case 0x1:
            value = (value & 0x0f) | (stream.readBitNumber(4) << 4);
            break;
        case 0x2:
            value = (value & 0x0f) | (stream.readBitNumber(8) << 4);
            break;
        case 0x3:
            value = (value & 0x0f) | (stream.readBitNumber(28) << 4);
            break;
        };

        return value + 1;
    };

    DotaDemo.prototype.readEntityPropList = function(stream) {
        var props = [];
        var cursor = -1;
        var offset = 0;

        while (true) {
            if (stream.readBit()) {
                cursor++;
            } else {
                var offset = stream.readVarInt();

                if (offset == 0x3FFF) {
                    break;
                }

                cursor += offset + 1;
            }

            props.push(cursor);
        }

        return props;
    };

    DotaDemo.prototype.readPacketEntities = function(msg)
    {
        var stream = new BitStream(msg.entity_data.clone());
        var class_bits = Math.ceil(Math.log(this.serverInfo.max_classes) / Math.log(2));
        var index = -1;
        var pvs;
        var start = stream.byteBuffer.offset * 8 + stream.bitOffset;

        for (var i = 0; i < msg.updated_entries; ++i) {
            index += this.readEntityIndex(stream);
            pvs = stream.readBitNumber(2);

            switch(pvs) {
                case 0: /* Preserve */
                    assert(index in this.entities);

                    var entity = this.entities[index];
                    entity.pvs = pvs;

                    var propList = this.readEntityPropList(stream);
                    var recvTable = this.recvTables[entity.cls.table_name];

                    for (var j = 0; j < propList.length; ++j) {
                        var prop = recvTable[propList[j]];
                        var value = dota.prop.Decoder.readStream(stream, prop.prop);
                        entity.properties[prop.name] = value;
                    }
                    break;
                case 1: /* Leave */
                    console.log('Leave entity', index);
                    assert(index in this.entities);

                    var entity = this.entities[index];
                    entity.pvs = pvs;
                    break;
                case 2: /* Enter */
                    var classID = stream.readBitNumber(class_bits);
                    var serial = stream.readBitNumber(10);

                    assert(classID in this.classInfo);
                    var cls = this.classInfo[classID];

                    var entity = {
                        id: index,
                        cls: cls,
                        properties: {}
                    };

                    assert(cls.table_name in this.recvTables);
                    var recvTable = this.recvTables[cls.table_name];

                    var baselineTable = this.stringTables["instancebaseline"];
                    var baseline  = baselineTable.string_data["_" + classID];

                    var baseStream = new BitStream(baseline.value.clone());
                    var basePropList = this.readEntityPropList(baseStream)

                    for (var j = 0; j < basePropList.length; ++j) {
                        var prop = recvTable[basePropList[j]];
                        var value = dota.prop.Decoder.readStream(baseStream, prop.prop);
                        entity.properties[prop.name] = value;
                    }

                    var propList = this.readEntityPropList(stream);

                    for (var j = 0; j < propList.length; ++j) {
                        var prop = recvTable[propList[j]];
                        var value = dota.prop.Decoder.readStream(stream, prop.prop);
                        entity.properties[prop.name] = value;
                    }


                    console.log('Enter entity ' + entity.cls.network_name, entity);
                    this.entities[index] = entity;
                    break;
                case 3: /* Delete */
                    console.log('Delete entity', index);
                    assert(index in this.entities);
                    this.entities[index] = undefined;
                    break;
            }
        }

        if (msg.is_delta) {
            while (stream.readBit()) {
                var index = stream.readBitNumber(11);
                console.log('DeltaDelete entity', index);
                assert(index in this.entities);
                this.entities[index] = undefined;
            }
        }
    };

    DotaDemo.load = function(byteBuffer) {
        var demo = new DotaDemo();

        if (!dcodeIO.ByteBuffer.isByteBuffer(byteBuffer)) {
            throw(new Error("DotaDemo.load expects ByteBuffer as input."));
        }

        demo.read(byteBuffer);

        return demo;
    };

    global["DotaDemo"] = DotaDemo;
})(this);

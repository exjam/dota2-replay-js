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
        var header = byteBuffer.readUTF8StringBytes(8);
        var offset = byteBuffer.readUint32();

        if (header != "PBUFDEM") {
            //throw(new Error("DotaDemo.read: could not find PBUFDEM header"));
        }

        for (var i = 0; i < 1000; ++i) {
            this.readDemoMessage(byteBuffer);
        }
    };

    DotaDemo.prototype.readDemoMessage = function(byteBuffer)
    {
        var kind = byteBuffer.readVarint();
        var tick = byteBuffer.readVarint();
        var size = byteBuffer.readVarint();
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

                    while (buf.offset < buf.length) {
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
        var kind = byteBuffer.readVarint();
        var size = byteBuffer.readVarint();

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

            if (!(cls.class_id in this.classInfo)) {
                this.classInfo[cls.class_id] = { };
            }

            this.classInfo[cls.class_id].network_name = cls.network_name;
            this.classInfo[cls.class_id].table_name = cls.table_name;
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
                        info.name             = data.readUTF8StringBytes(32);
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

        this.netTables[msg.net_table_name] = msg.props;
    };

    DotaDemo.prototype.readGameCreateStringTable = function(msg)
    {
        if (!this.stringTables) {
            this.stringTables = { };
        }

        var table = new dota.StringTable(msg);
        table.readStream(msg.num_entries, new BitStream(msg.string_data));
        this.stringTables[msg.name] = table;
    };

    DotaDemo.prototype.readGameUpdateStringTable = function(msg)
    {
        if (msg.name in this.stringTables) {
            this.stringTables[msg.name].readStream(msg.num_changed_entries, new BitStream(msg.string_data));
        }
    };

    function assert(condition, message) {
        if (!condition) {
            throw message || "Assertion failed";
        }
    }

    DotaDemo.prototype.readPacketEntities = function(msg)
    {
        var stream = new BitStream(msg.entity_data.clone());
        var index = -1;
        var class_bits = Math.ceil(Math.log(this.serverInfo.max_classes) / Math.LOG2E);

        for (var i = 0; i < msg.updated_entries; ++i) {
            var pvs;

            {/*Read Entity Header */
                var value = stream.readBitNumber(6);

                if (value & 0x30) {
                    var bits = (value >> 2) & 0x0c;
                    bits += (bits == 12) ? 16 : 0;

                    value = (stream.readBitNumber(bits) << 4) | (value & 0xf);
                }

                index += value = 1;
                pvs = stream.readBitNumber(2);
            }

            switch(pvs) {
                case 0: /* Preserve */
                    break;
                case 1: /* Leave */
                    break;
                case 2: /* Enter */
                    var classID = stream.readBitNumber(class_bits);
                    var serial = stream.readBitNumber(10);

                    assert(classID in this.classInfo);
                    var cls = this.classInfo[classID];

                    assert(cls.table_name in this.netTables);
                    var sendTable = this.netTables[cls.table_name];

                    var entity = this.entities[index] = {
                        id: index,
                        cls: cls,
                        table: sendTable
                    };

                    var baselineTable = this.stringTables["instancebaseline"];
                    var baseline  = baselineTable.string_data["_" + classID];

                    break;
                case 3: /* Deleted */
                    break;
            }

            break;
        }
    };
/*
        message CSVCMsg_PacketEntities {
        optional int32 max_entries = 1;
        optional int32 updated_entries = 2;
        optional bool is_delta = 3;
        optional bool update_baseline = 4;
        optional int32 baseline = 5;
        optional int32 delta_from = 6;
        optional bytes entity_data = 7;
    }*/

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

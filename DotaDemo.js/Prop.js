(function(global) {
    var Prop = function(path, dt_prop)
    {
        this.var_name     = path + dt_prop.var_name;
        this.type         = dt_prop.type;
        this.flags        = dt_prop.flags;
        this.num_bits     = dt_prop.num_bits;
        this.priority     = dt_prop.priority;
        this.low_value    = dt_prop.low_value;
        this.high_value   = dt_prop.high_value;
        this.num_elements = dt_prop.num_elements;
    };

    var Type = function()
    {
        this.Int            = 0;
        this.Float          = 1;
        this.Vector         = 2;
        this.VectorXY       = 3;
        this.String_        = 4;
        this.Array_         = 5;
        this.DataTable      = 6;
        this.Int64          = 7;
    };

    var Flag = function()
    {
        this.Unsigned                = 1 <<  0;
        this.Coord                   = 1 <<  1;
        this.NoScale                 = 1 <<  2;
        this.RoundDown               = 1 <<  3;
        this.RoundUp                 = 1 <<  4;
        this.Normal                  = 1 <<  5;
        this.Exclude                 = 1 <<  6;
        this.Xyze                    = 1 <<  7;
        this.InsideArray             = 1 <<  8;
        this.ProxyAlways             = 1 <<  9;
        this.VectorElem              = 1 << 10;
        this.Collapsible             = 1 << 11;
        this.CoordMp                 = 1 << 12;
        this.CoordMpLowPrecision     = 1 << 13;
        this.CoordMpIntegral         = 1 << 14;
        this.CellCoord               = 1 << 15;
        this.CellCoordLowPrecision   = 1 << 16;
        this.CellCoordIntegral       = 1 << 17;
        this.ChangesOften            = 1 << 18;
        this.EncodedAgainstTickCount = 1 << 19;
    };

    Prop.prototype.COORD_INTEGER_BITS = 14;
    Prop.prototype.COORD_FRACTIONAL_BITS = 5;
    Prop.prototype.COORD_DENOMINATOR = 1 << Prop.COORD_FRACTIONAL_BITS;
    Prop.prototype.COORD_RESOLUTION = 1.0 / Prop.COORD_DENOMINATOR;

    Prop.prototype.COORD_INTEGER_BITS_MP = 11;
    Prop.prototype.COORD_FRACTIONAL_BITS_MP_LOWPRECISION = 3;
    Prop.prototype.COORD_DENOMINATOR_LOWPRECISION = 1 << Prop.COORD_FRACTIONAL_BITS_MP_LOWPRECISION;
    Prop.prototype.COORD_RESOLUTION_LOWPRECISION = 1.0 / Prop.COORD_DENOMINATOR_LOWPRECISION;

    Prop.prototype.NORMAL_FRACTIONAL_BITS = 11;
    Prop.prototype.NORMAL_DENOMINATOR = (1 << Prop.NORMAL_FRACTIONAL_BITS) - 1;
    Prop.prototype.NORMAL_RESOLUTION = 1.0 / Prop.NORMAL_DENOMINATOR;

    Prop.prototype.readStream = function(stream)
    {
        switch (this.type) {
            case dota.Prop.Type.Int:
                this.readInt(stream);
                break;
            case dota.Prop.Type.Float:
                this.readFloat(stream);
                break;
            case dota.Prop.Type.Vector:
                this.readVector(stream);
                break;
            case dota.Prop.Type.VectorXY:
                this.readVectorXY(stream);
                break;
            case dota.Prop.Type.String_:
                this.readString(stream);
                break;
            case dota.Prop.Type.Array_:
                this.readArray(stream);
                break;
            case dota.Prop.Type.DataTable:
                this.readDataTable(stream);
                break;
            case dota.Prop.Type.Int64:
                this.readInt64(stream);
                break;
        }
    };

    Prop.prototype.readInt = function(stream)
    {
        if (this.flags & dota.Prop.Flag.EncodedAgainstTickCount) {
            this.value = stream.readVarInt();

            if (!(this.flags & dota.Prop.Flag.Unsigned)) {
                //XXX: do something weird
            }
        } else {
            this.value = stream.readBitNumber(this.num_bits);

            if (!(this.flags & dota.Prop.Flag.Unsigned)) {
                //XXX: do something weird
            }
        }
    };

    Prop.prototype.readFloat = function(stream)
    {
        if (flags & dota.Prop.Flag.Coord) {
            this.readFloatCoord(stream);
        } else if (flags & dota.Prop.Flag.CoordMp) {
            this.readFloatCoordMp(stream);
        } else if (flags & dota.Prop.Flag.CoordMpIntegral) {
            this.readFloatCoordMpIntegral(stream);
        } else if (flags & dota.Prop.Flag.CoordMpLowPrecision) {
            this.readFloatCoordMpLowPrecision(stream);
        } else if (flags & dota.Prop.Flag.NoScale) {
            this.readFloatNoScale(stream);
        } else if (flags & dota.Prop.Flag.Normal) {
            this.readFloatNormal(stream);
        } else if (flags & dota.Prop.Flag.CellCoord) {
            this.readFloatCellCoord(stream);
        } else if (flags & dota.Prop.Flag.CellCoordIntegral) {
            this.readFloatCellCoordIntegral(stream);
        } else {
            this.readFloatDefault(stream);
        }
    };

    Prop.prototype.readFloatCoord = function(stream)
    {
        var int_ = stream.readBit();
        var frac = stream.readBit();

        if (!int_ && !frac) {
            this.value = 0.0;
            return;
        }

        var sign = stream.readBit();

        if (int_) {
            int_ = stream.readBitNumber(Prop.COORD_INTEGER_BITS);
        }

        if (frac) {
            frac = (float)stream.readBitNumber(Prop.COORD_FRACTIONAL_BITS);
        }

        this.value = int_ + frac * Prop.COORD_RESOLUTION;

        if (sign) {
            this.value = -this.value;
        }
    };

    Prop.prototype.readFloatCoordMp = function(stream)
    {
        var inBounds = stream.readBit();
        var int_ = stream.readBit();
        var sign = stream.readBit();

        if (int_) {
            if (mp) {
                int_ = stream.readBitNumber(Prop.COORD_INTEGER_BITS_MP + 1);
            } else {
                int_ = stream.readBitNumber(Prop.COORD_INTEGER_BITS + 1);
            }
        }

        var frac = (float)stream.readBitNumber(5);

        this.value = int_ + (frac * (1.0 / (1 << 5)));
        
        if (sign) {
            this.value = -this.value;
        }
    };

    Prop.prototype.readFloatCoordMpIntegral = function(stream)
    {
        var mp = stream.readBit();
        var int_ = stream.readBit();
        
        if (int_) {
            var sign = stream.readBit();

            if (mp) {
                this.value = stream.readBitNumber(Prop.COORD_INTEGER_BITS_MP + 1);
            } else {
                this.value = stream.readBitNumber(Prop.COORD_INTEGER_BITS + 1);
            }

            if (sign) {
                this.value = -this.value;
            }
        } else {
            this.value = 0.0;
        }
    };

    Prop.prototype.readFloatCoordMpLowPrecision = function(stream)
    {
        var mp = stream.readBit();
        var int_ = stream.readBit();
        var sign = stream.readBit();
        var frac;


        if (mp) {
            if (int_) {
                int_ = stream.readBitNumber(Prop.COORD_INTEGER_BITS_MP + 1);
            }

            frac = stream.readBitNumber(Prop.COORD_FRACTIONAL_BITS);
        } else {
            if (int_) {
                int_ = stream.readBitNumber(Prop.COORD_INTEGER_BITS + 1);
            }

            frac = stream.readBitNumber(Prop.COORD_FRACTIONAL_BITS);
        }

        this.value = int_ + (frac * (1.0 / (1 << 3)));

        if (sign) {
            this.value = -this.value;
        }
    };

    Prop.prototype.readFloatNoScale = function(stream)
    {
        //read 32bit float from stream..
    };

    Prop.prototype.readFloatNormal = function(stream)
    {
    };

    Prop.prototype.readFloatCellCoord = function(stream)
    {
    };

    Prop.prototype.readFloatCellCoordIntegral = function(stream)
    {
    };

    Prop.prototype.readFloatDefault = function(stream)
    {
    };

    Prop.prototype.readVector = function(stream)
    {
    };

    Prop.prototype.readVectorXY = function(stream)
    {
    };

    Prop.prototype.readString = function(stream)
    {
    };

    Prop.prototype.readArray = function(stream)
    {
    };

    Prop.prototype.readDataTable = function(stream)
    {
    };

    Prop.prototype.readInt64 = function(stream)
    {
    };

    if (!global["dota"]) { global["dota"] = { }; }
    global["dota"]["Prop"] = Prop;
    global["dota"]["prop"]["Type"] = new Type();
    global["dota"]["prop"]["Flag"] = new Flag();
})(this);

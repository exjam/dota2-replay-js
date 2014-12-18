(function(global) {
    var Type =  {
        Int            : 0,
        Float          : 1,
        Vector         : 2,
        VectorXY       : 3,
        String_        : 4,
        Array_         : 5,
        DataTable      : 6,
        Int64          : 7,
    };

    var Flag = {
        Unsigned                : 1 <<  0,
        Coord                   : 1 <<  1,
        NoScale                 : 1 <<  2,
        RoundDown               : 1 <<  3,
        RoundUp                 : 1 <<  4,
        Normal                  : 1 <<  5,
        Exclude                 : 1 <<  6,
        Xyze                    : 1 <<  7,
        InsideArray             : 1 <<  8,
        ProxyAlways             : 1 <<  9,
        VectorElem              : 1 << 10,
        Collapsible             : 1 << 11,
        CoordMp                 : 1 << 12,
        CoordMpLowPrecision     : 1 << 13,
        CoordMpIntegral         : 1 << 14,
        CellCoord               : 1 << 15,
        CellCoordLowPrecision   : 1 << 16,
        CellCoordIntegral       : 1 << 17,
        ChangesOften            : 1 << 18,
        EncodedAgainstTickCount : 1 << 19,
    };

    var Decoder = {};

    Decoder.COORD_INTEGER_BITS = 14;
    Decoder.COORD_FRACTIONAL_BITS = 5;
    Decoder.COORD_DENOMINATOR = 1 << Decoder.COORD_FRACTIONAL_BITS;
    Decoder.COORD_RESOLUTION = 1.0 / Decoder.COORD_DENOMINATOR;

    Decoder.COORD_INTEGER_BITS_MP = 11;
    Decoder.COORD_FRACTIONAL_BITS_MP_LOWPRECISION = 3;
    Decoder.COORD_DENOMINATOR_LOWPRECISION = 1 << Decoder.COORD_FRACTIONAL_BITS_MP_LOWPRECISION;
    Decoder.COORD_RESOLUTION_LOWPRECISION = 1.0 / Decoder.COORD_DENOMINATOR_LOWPRECISION;

    Decoder.NORMAL_FRACTIONAL_BITS = 11;
    Decoder.NORMAL_DENOMINATOR = (1 << Decoder.NORMAL_FRACTIONAL_BITS) - 1;
    Decoder.NORMAL_RESOLUTION = 1.0 / Decoder.NORMAL_DENOMINATOR;

    Decoder.readStream = function(stream, prop)
    {
        var value;

        switch (prop.type) {
        case Type.Int:
            value = Decoder.readInt(stream, prop);
            break;
        case Type.Float:
            value = Decoder.readFloat(stream, prop);
            break;
        case Type.Vector:
            value = Decoder.readVector(stream, prop);
            break;
        case Type.VectorXY:
            value = Decoder.readVectorXY(stream, prop);
            break;
        case Type.String_:
            value = Decoder.readString(stream, prop);
            break;
        case Type.Array_:
            value = Decoder.readArray(stream, prop);
            break;
        case Type.Int64:
            value = Decoder.readInt64(stream, prop);
            break;
        default:
            console.log('unexpected prop.type', prop.type);
            debugger;
            break;
        }

        return value;
    };

    Decoder.readInt = function(stream, prop)
    {
        var value;

        if (prop.flags & Flag.EncodedAgainstTickCount) {
            value = stream.readVarInt();
        } else {
            value = stream.readBitNumber(prop.num_bits);
        }

        // TODO: process values
        return value;
    };

    Decoder.readFloat = function(stream, prop)
    {
        var value;
        var flags = prop.flags;

        if (flags & Flag.Coord) {
            value = Decoder.readFloatCoord(stream, prop);
        } else if (flags & Flag.CoordMp) {
            value = Decoder.readFloatCoordMp(stream, prop);
        } else if (flags & Flag.CoordMpIntegral) {
            value = Decoder.readFloatCoordMpIntegral(stream, prop);
        } else if (flags & Flag.CoordMpLowPrecision) {
            value = Decoder.readFloatCoordMpLowPrecision(stream, prop);
        } else if (flags & Flag.NoScale) {
            value = Decoder.readFloatNoScale(stream, prop);
        } else if (flags & Flag.Normal) {
            value = Decoder.readFloatNormal(stream, prop);
        } else if (flags & Flag.CellCoord) {
            value = Decoder.readFloatCellCoord(stream, prop);
        } else if (flags & Flag.CellCoordIntegral) {
            value = Decoder.readFloatCellCoordIntegral(stream, prop);
        } else {
            value = Decoder.readFloatDefault(stream, prop);
        }

        return value;
    };

    Decoder.readFloatCoord = function(stream, prop)
    {
        var integral = stream.readBit();
        var fraction = stream.readBit();

        if (!integral && !fraction) {
            return 0.0;
        }

        var sign = stream.readBit();

        if (integral) {
            integral = stream.readBitNumber(Decoder.COORD_INTEGER_BITS) + 1;
        }

        if (fraction) {
            fraction = stream.readBitNumber(Decoder.COORD_FRACTIONAL_BITS);
        }

        var value = integral + (fraction * Decoder.COORD_RESOLUTION);
        return sign ? -value : value;
    };

    Decoder.readFloatCoordMp = function(stream, prop)
    {
        console.log('unimplemented readFloatCoordMp');
        debugger;
    };

    Decoder.readFloatCoordMpIntegral = function(stream, prop)
    {
        console.log('unimplemented readFloatCoordMpIntegral');
        debugger;
    };

    Decoder.readFloatCoordMpLowPrecision = function(stream, prop)
    {
        console.log('unimplemented readFloatCoordMpLowPrecision');
        debugger;
    };

    Decoder.readFloatNoScale = function(stream, prop)
    {
        return stream.readFloat();
    };

    Decoder.readFloatNormal = function(stream, prop)
    {
        var sign = stream.readBit();
        var value = stream.readBitNumber(Decoder.NORMAL_FRACTIONAL_BITS);
        value = value * Decoder.NORMAL_RESOLUTION;
        return sign ? -value : value;
    };

    Decoder.readFloatCellCoord = function(stream, prop)
    {
        var value = stream.readBitNumber(prop.num_bits);
        var fraction = stream.readBitNumber(Decoder.COORD_FRACTIONAL_BITS);
        return value + Decoder.COORD_RESOLUTION * fraction;
    };

    Decoder.readFloatCellCoordIntegral = function(stream, prop)
    {
        return stream.readBitNumber(prop.num_bits);
    };

    Decoder.readFloatDefault = function(stream, prop)
    {
        var value = stream.readBitNumber(prop.num_bits);
        value = value / ((1 << prop.num_bits) - 1);
        return value * (prop.high_value - prop.low_value) + prop.low_value;
    };

    Decoder.readVector = function(stream, prop)
    {
        var x = Decoder.readFloat(stream, prop);
        var y = Decoder.readFloat(stream, prop);
        var z = 0.0;

        if (prop.flags & Flag.Normal) {
            var f = x * x + y * y;
            z = 1.0 >= f ? 0.0 : Math.sqrt(1.0 - f);
            z = stream.readBit() ? -z : z;
        } else {
            z = Decoder.readFloat(stream, prop);
        }

        return { x: x, y: y, z: z };
    };

    Decoder.readVectorXY = function(stream, prop)
    {
        var x = Decoder.readFloat(stream, prop);
        var y = Decoder.readFloat(stream, prop);
        return { x: x, y: y };
    };

    Decoder.readString = function(stream, prop)
    {
        var length = stream.readBitNumber(9);
        return stream.readString(length);
    };

    Decoder.readArray = function(stream, prop)
    {
        var bits = Math.max(1, Math.ceil(Math.log(prop.num_elements) / Math.log(2)));

        var count = stream.readBitNumber(bits);
        var value = [];

        for (var i = 0; i < count; ++i) {
            value.push(Decoder.readStream(stream, prop.template));
        }

        return value;
    };

    Decoder.readInt64 = function(stream, prop)
    {
        var value;

        if (prop.flags & Flag.EncodedAgainstTickCount) {
            value = stream.readVarInt();
        } else {
            var sign = 0;
            var remainder = prop.num_bits - 32;

            if (!(prop.flags & Flag.Unsigned)) {
                sign = stream.readBit();
                remainder -= 1;
            }

            var lo = stream.readBitNumber(32);
            var hi = stream.readBitNumber(remainder);

            value = new dcodeIO.Long(lo, hi);

            if (sign) {
                value = value.negate();
            }
        }

        return value;
    };

    if (!global["dota"]) { global["dota"] = { }; }
    global["dota"]["prop"] = {};
    global["dota"]["prop"]["Decoder"] = Decoder;
    global["dota"]["prop"]["Type"] = Type;
    global["dota"]["prop"]["Flag"] = Flag;
})(this);

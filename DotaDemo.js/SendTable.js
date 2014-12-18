(function(global) {

var SendTableFlattener = function(lookup, descendant) {
    this.lookup = lookup;
    this.descendant = descendant;
    this.exclusions = this.aggregateExclusions(descendant);
    this.receiveProps = [];
};

SendTableFlattener.prototype.aggregateExclusions = function(table) {
    var exclusions = [];

    for (var i = 0; i < table.props.length; ++i) {
        var prop = table.props[i];

        if (prop.flags & dota.prop.Flag.Exclude) {
            exclusions.push(prop.dt_name + "," + prop.var_name);
        } else if (prop.type == dota.prop.Type.DataTable) {
            exclusions = exclusions.concat(this.aggregateExclusions(this.lookup[prop.dt_name]));
        }
    }

    return exclusions;
};

SendTableFlattener.prototype.flatten = function()
{
    this._flatten(this.descendant, [], [], null);
    return this.receiveProps;
};

SendTableFlattener.prototype._flatten = function(ancestor, accumulator, path, src)
{
    this._flattenCollapsible(ancestor, accumulator, path, src);

    var name = path.join('.');

    if (name.length) {
        name += '.';
    }

    for (var i = 0; i < accumulator.length; ++i) {
        var found = accumulator[i];
        this.receiveProps.push({
            prop: found.prop,
            source: src ? src : found.table,
            name: name + found.prop.var_name
        });
    }
};

SendTableFlattener.prototype._flattenCollapsible = function(ancestor, accumulator, path, src)
{
    for (var i = 0; i < ancestor.props.length; ++i) {
        var prop = ancestor.props[i];

        if (prop.flags & (dota.prop.Flag.Exclude | dota.prop.Flag.InsideArray)) {
            continue;
        }

        if (this.exclusions.indexOf(ancestor.net_name + "," + prop.var_name) !== -1) {
            continue;
        }

        if (prop.type === dota.prop.Type.DataTable) {
            if (prop.flags & dota.prop.Flag.Collapsible) {
                this._flattenCollapsible(this.lookup[prop.dt_name], accumulator, path, src);
            } else {
                path.push(prop.var_name);
                this._flatten(this.lookup[prop.dt_name], [], path, src == null ? ancestor.net_name : src);
                path.pop();
            }
        } else {
            accumulator.push({ prop: prop, table: ancestor.net_name });
        }
    }
};

if (!global["dota"]) { global["dota"] = { }; }
global["dota"]["SendTableFlattener"] = SendTableFlattener;

})(this);

//node constructor class
function ColorNode() {

    this.addOutput("", "hcolor");

    this.size = [222, 54];
    this.properties = {red:255, green:255, blue:255};

    this.target = -1;
    this.old_y = -1;
    this._remainder = 0;
    this._precision = 0;
    this.mouse_captured = false;

}

//name to show
ColorNode.title = "Color";
ColorNode.position = [10, 50];
ColorNode.size = [300, 50];

//function to call when the node is executed
ColorNode.prototype.onExecute = function() {

    var color = [this.properties.red / 255.0, this.properties.green / 255.0, this.properties.blue / 255.0];
    this.setOutputData(0, color);
}

ColorNode.markers_color = "#666";
ColorNode.pixels_threshold = 10;

ColorNode.prototype.onDrawForeground = function(ctx)
{
    var x0 = this.size[0]*0.16;
    var x1 = this.size[0]*0.5;
    var x2 = this.size[0]*0.84;

    var h = this.size[1];

    if(h > 30)
    {
        ctx.fillStyle = ColorNode.markers_color;
        ctx.beginPath(); ctx.moveTo(x0,h*0.1); ctx.lineTo(x0+h*0.1,h*0.2); ctx.lineTo(x0+h*-0.1,h*0.2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x0,h*0.9); ctx.lineTo(x0+h*0.1,h*0.8); ctx.lineTo(x0+h*-0.1,h*0.8); ctx.fill();

        ctx.beginPath(); ctx.moveTo(x1,h*0.1); ctx.lineTo(x1+h*0.1,h*0.2); ctx.lineTo(x1+h*-0.1,h*0.2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x1,h*0.9); ctx.lineTo(x1+h*0.1,h*0.8); ctx.lineTo(x1+h*-0.1,h*0.8); ctx.fill();

        ctx.beginPath(); ctx.moveTo(x2,h*0.1); ctx.lineTo(x2+h*0.1,h*0.2); ctx.lineTo(x2+h*-0.1,h*0.2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x2,h*0.9); ctx.lineTo(x2+h*0.1,h*0.8); ctx.lineTo(x2+h*-0.1,h*0.8); ctx.fill();

        ctx.font = (h * 0.7).toFixed(1) + "px Arial";
    }
    else
        ctx.font = (h * 0.8).toFixed(1) + "px Arial";

    ctx.textAlign = "center";
    var fontSize = (h * 0.7).toFixed(1);
    ctx.font = fontSize + "px Arial";
    ctx.fillStyle = "#EEE";
    ctx.fillText( this.properties.red, x0, h * 0.75);
    ctx.fillText( this.properties.green, x1, h * 0.75);
    ctx.fillText( this.properties.blue, x2, h * 0.75);

    var fontSize = (h * 0.2).toFixed(1);
    ctx.font = fontSize + "px Arial";
    ctx.fillText( "R", x0 - h * 0.5, h * 0.2);
    ctx.fillText( "G", x1 - h * 0.5, h * 0.2);
    ctx.fillText( "B", x2 - h * 0.5, h * 0.2);

    ctx.fillStyle = "rgb(" + this.properties.red + "," + this.properties.green + "," + this.properties.blue + ")";
    ctx.fillRect(0, this.size[1] - 4, this.size[0] + 1, 4);
}

ColorNode.prototype.onMouseDown = function(e, pos)
{
    if(pos[1] < 0)
        return;

    if (pos[0] < this.size[0] * 0.3333) {
        this.target = 0;
    }
    else if (pos[0] > this.size[0] * 0.3333 && pos[0] < this.size[0] * 0.6666) {
        this.target = 1;
    }
    else {
        this.target = 2;
    }

    this.old_y = e.canvasY;
    this.captureInput(true);
    this.mouse_captured = true;

    return true;
}

ColorNode.prototype.onMouseMove = function(e)
{
    if(!this.mouse_captured)
        return;

    var delta = this.old_y - e.canvasY;
    if(e.shiftKey)
        delta *= 10;
    if(e.metaKey || e.altKey)
        delta *= 0.1;
    this.old_y = e.canvasY;

    var steps = (this._remainder + delta / ColorNode.pixels_threshold);
    this._remainder = steps % 1;
    steps = steps|0;

    if (this.target == 0) {
        var v = Math.clamp( this.properties.red + steps, 0, 255 );
        this.properties.red = v;
    }
    else if (this.target == 1) {
        var v = Math.clamp( this.properties.green + steps, 0, 255 );
        this.properties.green = v;
    }
    else if (this.target == 2) {
        var v = Math.clamp( this.properties.blue + steps, 0, 255 );
        this.properties.blue = v;
    }

    this.setDirtyCanvas(true);
}

ColorNode.prototype.onMouseUp = function(e,pos)
{
    if(e.click_time < 200)
    {
        var steps = pos[1] > this.size[1] * 0.5 ? -1 : 1;
        if (this.target == 0) {
            this.properties.red = Math.clamp( this.properties.red + steps, 0, 255 );
        }
        else if (this.target == 1) {
            this.properties.green = Math.clamp( this.properties.green + steps, 0, 255 );
        }
        else if (this.target == 2) {
            this.properties.blue = Math.clamp( this.properties.blue + steps, 0, 255 );
        }
        this.setDirtyCanvas(true);
    }

    if( this.mouse_captured )
    {
        this.mouse_captured = false;
        this.captureInput(false);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/color", ColorNode);

export default class lineChat {
    constructor(dom, params)
    { 
        if(params)
        {
            let os = Object.prototype.toString.call(dom)
            if( os === "[object String]" )
            {
                this.dom = dom
                this.$ = document.querySelector(dom)
            }
            else if( os === "[object Object]")
            {
                this.dom = os.id || ""
                this.$ = os
            }
            else
                throw "dom非法"
        }
        else
        {
            params = dom
            this.dom = "#line-chat"
            this.$ = document.querySelector(this.dom)
        }

        this.param = {
            type: "line",
            width: '100%',
            height: '100%',
            space: 20,
            line: {
                style: '#fff',
                width: 1,
                arcR : 2,
                num  : 4,
                alpha: 1
            },
            point: {
                outStyle: '#fff',
                inStyle: '#0FC69B',
                outR: 6,
                inR: 4,
                alpha: 1
            },
            Bezier: {
                style: '#fff',
                width: 2,
                alpha: 1,
                bg : "#3477BB", 
                bgAlpha: 1 
            },
            data: {
                y: [0, 0],
                hasPoint: []
            },
            shan: {
                sr: 30,
                scolor: "#fff",
                color: [],
            }
        }

        this._extend(this.param, params)
        
    }

    _extend(obj1, obj2) {
        for(let key in obj2)
        {
            let os = Object.prototype.toString.call(obj2[key])
            if(os === "[object Array]" || os === "[object Object]")
            {
                this._extend(obj1[key], obj2[key])
            }
            else
                obj1[key] = obj2[key]            
        }
    }

    init() {
        const canvas  = this.canvas 
                      = document.createElement("canvas")
        const _width  = this.$.clientWidth,
              _height = this.$.clientHeight
        if(~(this.param.width + "").indexOf('%'))
        {
            let width = parseInt(this.param.width)
            canvas.width = _width * width / 100
        }
        else
            canvas.width = this.param.width
        if(~(this.param.height + "").indexOf('%'))
        {
            let height = parseInt(this.param.height)
            canvas.height = _height * height / 100
        }
        else
            canvas.height = this.param.height
    
        if (canvas.getContext)
            this.ctx = canvas.getContext("2d")
        else
            throw "浏览器不支持"
        
        
        switch(this.param.type) {
            case 'shan':
                this.drawShan()
                break
            default:
                this.drawLine()
        }
        this.$.appendChild(canvas)
    }

    drawShan() {
        this._computeArc()
        this.computeShanData = this._computeShanData()
        this._drawShan()
    }

    _drawShan() {
        const { sr, color, br, x, y, scolor} = this.param.shan,
              computeShanData         = this.computeShanData
        
        computeShanData.forEach((item, index) => {
            this._drawShanB(x, y, br, item.begin, item.end, color[index])
        });
        this._drawShanB(x, y, sr, 0, 2 * Math.PI, scolor)
    }

    _drawShanB(x, y, r, sAngle, eAngle, color) {
        const ctx = this.ctx
        color || (color = this.getRandomColor())
        ctx.save()
        ctx.beginPath()

        ctx.moveTo(x, y)
        ctx.fillStyle = color
        ctx.arc(x, y, r, sAngle, eAngle)
        ctx.fill()

        ctx.closePath()
        ctx.restore()
    }

    getRandomColor() {    
        const colorStr = "0123456789abcdef"
        const color    = [0,0,0,0,0,0].map(() => {
            return colorStr.charAt(Math.floor(Math.random() * 16))
        })
        return "#" + color.join('')
    } 

    _computeShanData() {
        const data = this.param.data.y || [],
              base = data.reduce((a, b) => {
                    return a + b
              }),
              P = 2 * Math.PI
        let count = 0
        return data.map((item) => {
            let begin = count,
                end   = count + item / base * P
            count = end
            return {
                begin,
                end
            }
        })
    }

    _computeArc() {
        const width  = this.canvas.width,
              height = this.canvas.height
        this.param.shan.br = width > height ? height / 2 : width / 2
        this.param.shan.x  = width / 2
        this.param.shan.y  = height / 2 
    }

    drawLine() {
        this._drawLine()
        this.computedPoint = this._compute()
        this.drawPoint = this._getControlPoint(this.computedPoint)
        this._drawBezier()

        this._drawPoint()
    }

    _drawBezier() {
        const ctx = this.ctx,
              cp  = this.computedPoint,
              dp  = this.drawPoint,
              { style, width, alpha, bg, bgAlpha } = this.param.Bezier
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = style
        ctx.lineWidth = width 
        ctx.globalAlpha = alpha
        ctx.fillStyle = bg
        ctx.moveTo(cp[0].x, cp[0].y)
        dp.forEach(({cp1x, cp1y, cp2x, cp2y, x, y})=>{
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
        })
        ctx.stroke()

        ctx.globalAlpha = bgAlpha

        ctx.lineTo(this.canvas.width - this.param.point.outR, this.canvas.height - this.param.line.arcR)
        ctx.lineTo(this.param.point.outR, this.canvas.height - this.param.line.arcR)
        ctx.lineTo(cp[0].x, cp[0].y)
        ctx.fill()


        ctx.closePath()
        ctx.restore()
    }

    _drawLine() {   
        const points = this._getPointByLine(),
              ctx    = this.ctx,
              { style, width, arcR, alpha } = this.param.line
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = style
        ctx.fillStyle = style
        ctx.lineWidth = width
        ctx.globalAlpha = alpha

        points.forEach((point) => {
            ctx.moveTo(point.x1, point.y1)
            ctx.lineTo(point.x2, point.y2)
        })

        ctx.stroke()
        
        points.forEach((point) => {
            ctx.moveTo(point.x1, point.y1)
            ctx.arc(point.x1, point.y1, arcR, 0 * Math.PI, 2 * Math.PI)
            ctx.moveTo(point.x1, point.y1)
            ctx.arc(point.x2, point.y2, arcR, 0 * Math.PI, 2 * Math.PI)
        })
        ctx.fill()

        ctx.closePath()


        ctx.restore()
    }


    _drawPoint() {
        const points = this.computedPoint,
              ctx    = this.ctx,
              { outStyle, inStyle, outR, inR, alpha } = this.param.point,
              hasPoint = this.param.data.hasPoint
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = outStyle
        ctx.globalAlpha = alpha
        points.forEach((point, index) => {
            if(~hasPoint.indexOf(index)){
                ctx.moveTo(point.x, point.y)
                ctx.arc(point.x, point.y, outR, 0 * Math.PI, 2 * Math.PI)
            }
        })
        ctx.fill()
        ctx.closePath()
        ctx.beginPath()
        ctx.fillStyle = inStyle
        points.forEach((point, index) => {
            if(~hasPoint.indexOf(index)){
                ctx.moveTo(point.x, point.y)
                ctx.arc(point.x, point.y, inR, 0 * Math.PI, 2 * Math.PI)
            }
        })
        ctx.fill()


        ctx.closePath()
        ctx.restore()
    }

    _getPointByLine() {
        const points = [],
              { num, arcR } = this.param.line,
              outR   = this.param.point.outR,
              width  = this.canvas.width - (outR - arcR),
              height = this.canvas.height - arcR * 2,
              skill  = height / num
        let   point  = arcR
        while(point <= height + arcR * 2)
        {
            points.push({
                x1: outR - arcR,
                y1: point,
                x2: width,
                y2: point
            })
            point += skill
        }
        return points
    }

    _compute() {
        const data   = this.param.data.y || [],
              { outR } = this.param.point,
              length = data.length,
              half = this.canvas.height / 2 - this.param.space,
              width = this.canvas.width - outR * 2,
              skill = width / (length - 1)
        let   point = outR

        
        const scales = half / Math.abs(this._findMax(data) - data[0])
        
        const disparity = data.map((item) => {
            return (data[0] - item) * scales + half + this.param.space
        })

        const points = disparity.map((item) => {
            let x = point
            point += skill
            return {
                x: x,
                y: item
            }
        })

        return points
    }



    _findMax(arr) {
        const arr2 = arr.concat([])
        arr2.sort((a, b) => {
            return Math.abs(b - arr[0]) - Math.abs(a - arr[0])
        })
        return arr2[0] || 1
    }


    _getControlPoint(path) {
        let rt = 0.3;
        let i = 0, count = path.length - 2;
        let arr = []
        const point = this.computedPoint

        if(count < 1)
        {
            return point.map((item) => {
                return {
                    cp1x: item.x,
                    cp1y: item.y,
                    cp2x: item.x,
                    cp2y: item.y,
                    x : item.x,
                    y : item.y
                }
            })
        }

        for (; i < count; i++) {
            let a = path[i], b = path[i + 1], c = path[i + 2];
            let v1 = new Vector2(a.x - b.x, a.y - b.y);
            let v2 = new Vector2(c.x - b.x, c.y - b.y);
            let v1Len = v1.length(), v2Len = v2.length();
            let centerV = v1.normalize().add(v2.normalize()).normalize();
            let ncp1 = new Vector2(centerV.y, centerV.x * -1);
            let ncp2 = new Vector2(centerV.y * -1, centerV.x);
            if (ncp1.angle(v1) < 90) {
                let p1 = ncp1.multiply(v1Len * rt).add(b);
                let p2 = ncp2.multiply(v2Len * rt).add(b);
                arr.push(p1, p2)
            } else {
                let p1 = ncp1.multiply(v2Len * rt).add(b);
                let p2 = ncp2.multiply(v1Len * rt).add(b);
                arr.push(p2, p1)
            }
        }

        
        const drawPoint = []
        i = 0
        point.forEach((item, index) => {
            if(index === point.length - 1)
            {
                drawPoint.push({
                    cp1x: arr[i].x,
                    cp1y: arr[i].y,
                    cp2x: item.x,
                    cp2y: item.y,
                    x : item.x,
                    y : item.y
                })
            }
            else if(index === 0)
            {

            }
            else if(index === 1)
            {
                drawPoint.push({
                    cp1x: arr[i].x,
                    cp1y: arr[i].y,
                    cp2x: item.x,
                    cp2y: item.y,
                    x : item.x,
                    y : item.y
                })
                i += 1
            }
            else
            {
                drawPoint.push({
                    cp1x: arr[i].x,
                    cp1y: arr[i].y,
                    cp2x: arr[i + 1].x,
                    cp2y: arr[i + 1].y,
                    x : item.x,
                    y : item.y
                })
                i += 2
            }
        })


        return drawPoint;
    }
}


class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let inv = 1 / this.length();
        return new Vector2(this.x * inv, this.y * inv);
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    multiply(f) {
        return new Vector2(this.x * f, this.y * f);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    angle(v) {
        return Math.acos(this.dot(v) / (this.length() *v.length())) * 180 / Math.PI;
    }

    
}

window && (window.lineChat = lineChat)
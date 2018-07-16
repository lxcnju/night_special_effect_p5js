// 实现二维的星空特效(一闪一闪亮晶晶)
// 实现思路是：确定方格大小s，将画布分为m*n个小方格，每个方格里面随机选取一个点，然后连接该点和周围八个方格内的点
//             根据点与点之间的距离进行得到线的透明度，绘制线，根据这个点所连接的所有线的透明度之和确定这个点的透明度
//             点的位置、透明度，星空的颜色都由三角函数进行更新

var gridSize = 60;       // 方块大小
var grids = [];          // 存储所有方块
var rows = 0;            // 行数
var cols = 0;            // 列数

var maxDisTance = 1.5 * gridSize;    // 两点之间最大距离，超过这个距离透明度为0，即不显示
var pointRatio = 0.12;               // 点大小，和gridSize的比例

var r = 0;               // 星空颜色
var g = 0;
var b = 0;
var stepRed = 0.011173;  // 颜色更新的三角函数系数
var stepGreen = 0.025417;
var stepBlue = 0.037219;

var steps = 0;           // 绘制的步数
var frate = 8;           // 帧率

function setup() {
	createCanvas(1350, 800);
	
	r = random(0, 255);               // 初始化颜色
	g = random(0, 255);
	b = random(0, 255);
	
	rows = floor(height/gridSize);   // 行列数目
	cols = floor(width/gridSize);
	// 构造grids
	for(var j = 0; j < rows; j++){
		var rowGrids = [];
		for(var i = 0; i < cols; i++){
			rowGrids.push(new grid(i, j, gridSize));
		}
		grids.push(rowGrids);
	}
	frameRate(frate);
}

function draw() {
	background(0);
	for(var j = 0; j < rows; j++){
		for(var i = 0; i < cols; i++){
			grids[j][i].updatePoint();             // 更新方格内点的信息
		}
	}
	for(var j = 0; j < rows; j++){
		for(var i = 0; i < cols; i++){
			var pointAlpha = 0.0;                  // 点的透明度
			// 周围一圈的点
			for(var jj = max(j - 1, 0); jj <= min(j + 1, rows - 1); jj++){
				for(var ii = max(i - 1, 0); ii <= min(i + 1, cols - 1); ii++){
					pointAlpha += drawLine(i, j, ii, jj);      // 绘制线段，返回线段的透明度
				}
			}
			pointAlpha = smoothstep(0.0, 8.0, pointAlpha);     // 归一化
			grids[j][i].drawPoint(pointAlpha);                 // 画点
		}
	}
	// 更新星空颜色
	r = min(255, max(0, r + sin(steps * PI * stepRed) * 255));
	g = min(255, max(0, g + sin(steps * PI * stepGreen) * 255));
	b = min(255, max(0, b + sin(steps * PI * stepBlue) * 255));
	// 出现黑色，重新选取
	if(r == 0 && g == 0 && b == 0){
		stepRed = random(0.01, 0.1);
		stepGreen = random(0.01, 0.1);
		stepBlue = random(0.01, 0.1);
		r = min(255, max(0, r + sin(steps * PI * stepRed) * 255));
		g = min(255, max(0, g + sin(steps * PI * stepGreen) * 255));
		b = min(255, max(0, b + sin(steps * PI * stepBlue) * 255));
	}
	steps += 1;
	if(steps >= 100){
		steps = random(0, 10);
	}
}

// 星空的点
function nightPoint(x, y, s){
	this.x = x;
	this.y = y;
	this.s = s;
}

// 小方格
function grid(i, j, s){
	this.i = i;              // 索引
	this.j = j;
	this.leftx = i * s;      // 左上角位置
	this.lefty = j * s;
	this.s = s;              // 大小
	
	this.t = random(0, 100);   // 位置更新的步数
	this.nightpt = new nightPoint(0.0, 0.0, 0.0);   // 小方格内初始一个点
	// 更新点
	this.updatePoint = function(){
		this.nightpt.x = (this.i + sin(this.t * PI / 50.0)/2 + 0.5) * this.s;           // 位置
		this.nightpt.y = (this.j + cos(this.t * PI / 50.0)/2 + 0.5) * this.s;
		this.nightpt.s = ((sin(this.t * 0.5)/2 + 0.5) * pointRatio + 0.02) * this.s;    // 大小
		this.t += 1;
		if(this.t > 100){
			this.t = 0;
		}
	}
	// 画点
	this.drawPoint = function(pointAlpha){
		fill(r, g, b, (pointAlpha/2 + 0.5) * 255);
		ellipse(this.nightpt.x, this.nightpt.y, this.nightpt.s, this.nightpt.s);        // 画椭圆
	}
}

// 画线
function drawLine(i1, j1, i2, j2){
	var x1 = grids[j1][i1].nightpt.x;
	var y1 = grids[j1][i1].nightpt.y;
	var x2 = grids[j2][i2].nightpt.x;
    var y2 = grids[j2][i2].nightpt.y;
	
	var d = sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));          // 距离
	var alpha = smoothstep(maxDisTance, 0.0, d);                          // 根据距离设置透明度
	stroke(r, g, b, alpha * 255);
	strokeWeight(2);
	strokeCap(ROUND);
	line(x1, y1, x2, y2);
	return alpha;                   // 返回透明度
}

// 归一化
function smoothstep(x1, x2, x){
	// x1是x可能的最小值，x2是可能的最大值
	var normx = (x - x1)/(x2 - x1);              // 缩放
	normx = max(0.0, min(normx, 1.0));           // clip到0-1内
	return normx * normx * (3.0 - 2.0 * normx);  // Hermite插值
}
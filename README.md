# night_special_effect_p5js
Creating a night special effect simply.

写一个简单的星空特效，用p5.js。

* 代码架构
* 原理解析

## 代码架构
 * night.js   星空特效实现的p5.js代码
 * home.html  主页，用浏览器打开即可
 
## 原理解析
  本项目模拟实现了星空中星星一闪一闪地移动，并且星星之间还有星座线的特效，星座线颜色会不断变化，若隐若现。首先需要设计星星的位置，下面给出了一个简单的原理图：<br>
  <div align=center><img src="https://github.com/lxcnju/night_special_effect_p5js/blob/master/night.png"/></div> <br>
  从图中可以看出，先将屏幕上的画布按照gridSize进行划分为小方格，然后在小方格里面随机选择一个点，作为星星的位置，比如图中A B C D四个小圈圈就是代表了星星。这样，星星的位置就找到了，接下来就在自己的小方格里面运动，这样的话会显得随机但又有规律可循。<br>
  接下来，绘制星座线，对于一个小方格的点，比如A点，会向周围八个小方格的星星连线（如果在边缘的话没有八个），如果全部连接的话会导致满屏幕都是线，不美观，所以要根据某些方式来限制一部分线条，这里就是选择星星之间的距离。比如，A与B比较近，则绘制一条连线，并且透明度比较高；A与C则离得很远，则断开连线，即设置其透明度为0。那么线的alpha具体如何通过两点之间距离dist来转换呢，这里引入一个Smooth的过程：<br>
  <div align=center>
  dist = (dist - minDist)/(maxDist - minDist) <br>
  dist = 1 - clip(dist, 0.0, 1.0) <br>
  alpha = dist * dist * (3 - 2 * dist) <br>
  </div><br>
  从上面可以看出，如果想要将一个值归一化到0~1范围内，需要先通过Max-Min进行归一化到0~1，然后不使用线性过渡，而是引入了Hermite插值，构造三次曲线进行映射，使得得到的值更理想。<br>
  如何选择minDist和maxDist呢，这就取决于想要显示的线条数量了，如果maxDist=2 * 1.41 * gridSize，那么线条都会显示，只是透明度不一样。如果maxDist=1.5 * gridSize，那么超过这个值的距离的两个星星之间alpha为0.0，即不显示。 <br>
  上面解决了星星连线的问题，那么接下来考虑星星如何移动的问题，为了使得星星移动地比较有规律，而不是随机移动，引入了三角函数进行更新位置，即：<br>
  <div align=center>
  x = x + sin(c1 * t) <br>
  y = y + cos(c2 * t) <br>
  </div><br>
  c1和c2是常数项，为每个小方格维护一个t值，代表计数器，则星星会按照某种三角曲线进行移动，比如图中的D星星按照C1曲线进行移动，但是不能超过边界，超过小方格边界的设置为在小方格边界上，继续下一步移动。初始化时为不同的小方格内星星初始化不同的t值，由于位置和t都是随机初始化的，那么星星与星星之间移动的轨迹就会多样化了，不会产生所有的星星运动轨迹一样的结果。 <br>
  之后是星星的大小和星座线的颜色的问题了，二者也是通过三角曲线进行更新，所以星星会有一闪一闪的效果，星座线的颜色会渐渐改变（由于采用了三角曲线进行更新，所以颜色变化不会很剧烈）。 <br>
  下面给出一段gif示例：<br>
  <div align=center><img src="https://github.com/lxcnju/night_special_effect_p5js/blob/master/night.gif"/></div> <br>
 


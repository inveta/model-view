# Model View

基于 Zero Overhead 原则的草量级 3D 模型渲染组件，在线演示：https://pqo.gitee.io/model-view/demo/

```
<script src="model-view.js"></script>
<canvas is="model-view" src="path/to/model.bin" width="500" height="500"></canvas>
```

| model-view           | 大小   | 内容                   |
| -------------------- | ------ | ---------------------- |
| model-view.js        | 5.0 KB | 源文件：含注释和空白符 |
| model-view.min.js    | 3.5 KB | 代码丑化工具编译后     |
| model-view.min.js.gz | 1.5 KB | Gzip 压缩后：http 传输 |

## 动机

市面上的 WebGL 库为了支持 3D 模型的各种属性，文件体积异常庞大，动辄 1M 以上，但很多时候用户只需要简单直观地展示一下模型，并不关心图形学中乱七八糟的功能，也就是所谓的“零负担原则”（zero overhead principle），因此本项目诞生，本项目选取了三维模型中最关键的几个属性，其他的一概不支持！因此得以让库文件保持几 KB，用最小的开销渲染尽可能多的信息：本库不支持市面上任何的三维模型格式，取而代之的是自定义的，可直接传入 WebGL 缓冲区的二进制格式。

- 轻巧组件：渲染所占资源极小；使用了 html 组件化
- 聚焦透视：自动聚焦到物体的包围盒，并且透视投影
- 多种材质：支持给三角面分组，每组分配不同的颜色
- 扁平着色：模拟一束来自视点的平行光线
- 简单交互：支持鼠标操作，围绕物体旋转缩放

## 自定义原生格式

| 二进制格式  | 类型      | 长度         | 作用                       |
| ----------- | --------- | ------------ | -------------------------- |
| json length | Uint 32   | 4 字节       | 定义了下一块的长度         |
| json        | JSON 文本 | 由上一块决定 | json 文本 ascii            |
| 顶点坐标    | 数组      | 由上一块决定 | 每个顶点由 3 个 float 组成 |
| 三角索引    | 数组      | 余下的长度   | 索引的数量由上上块决定     |

## JSON 格式

| JSON 字典               | 类型        | 作用                       |
| ----------------------- | ----------- | -------------------------- |
| position_length         | 整数        | 顶点数组的长度，字节       |
| length                  | float       | 包围球直径 or 包围盒对角线 |
| extensions              | string 列表 | WebGL 的扩展功能           |
| groups                  | 字典列表    | 三角面的分组               |
| groups -> color         | vector4     | 分组的颜色                 |
| groups -> indexCount    | 整数        | 分组的长度                 |
| groups -> componentType | WebGL 类型  | 索引的类型                 |
| groups -> offset        | 整数        | 分组的偏移值，字节         |

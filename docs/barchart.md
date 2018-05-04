# BarChart

> 柱状图



## BarChart Attributes

| Option | Description |  type  |
| :----: | :---------: | :----: |
| width  |    图表宽度     | Number |
| height |    图表高度     | Number |
| title  |    图表描述     | Object |
| legend |    图表图例     | Object |
| xAxis  |   图表 x 轴    | Object |
| yAxis  |   图表 y 轴    | Object |


## title Attributes

|  Option  |           Description            | default |  type   |
| :------: | :------------------------------: | :-----: | :-----: |
|  enable  |               是否显示               |  false  | Boolean |
|   text   |                内容                |    -    | String  |
|  offset  | x y 轴方向的偏移值，基于左下角，例如: [5.0, 5.0] |    -    |  Array  |
|  color   |               字体颜色               |    -    | String  |
| fontSize |               字体大小               |    -    | Number  |

```json
  title: {
	enable: true,
	text: 'test',
	offset: [5.0, 5.0],
	color: '#000000',
	fontSize: 10
  }
```

## legend Attributes

|       Option        |               Description                | default |  type   |        acceptable values        |
| :-----------------: | :--------------------------------------: | :-----: | :-----: | :-----------------------------: |
|       enable        |                   是否显示                   |  false  | Boolean |                -                |
|   wordWrapEnable    | Legend 的内容超出图表边界之外，是否创建一个新的行。 请注意，这会降低性能和仅适用于” legend 位于图表下面”的情况 |    -    | Boolean |                -                |
| horizontalAlignment |                  设置图例位置                  |    -    | String  |   `LEFT` `CENTER`    `RIGHT`    |
|  verticalAlignment  |                  设置图例位置                  |    -    | String  |     `TOP` `CENTER` `BOTTOM`     |
|     orientation     |               图例显示方式，水平或垂直               |    -    | String  |     `HORIZONTAL` `VERTICAL`     |
|      direction      |           图例显示方向，先图例再文字或先文字再图例           |    -    | String  | `LEFT_TO_RIGHT` `RIGHT_TO_LEFT` |
|        data         |        如果 data 有数据，优先处理 data，详见下表        |    -    |  Array  |                -                |

### legend data Attributes

|    Option     | Description | default |  type  |            acceptable values             |
| :-----------: | :---------: | :-----: | :----: | :--------------------------------------: |
|     label     |    文字信息     |    -    | String |                    -                     |
|     form      |    图例样式     |    -    | String | `NONE` `EMPTY` `DEFAULT` `SQUARE` `CIRCLE` `LINE` |
|   formSize    |    图例大小     |    -    | Number |                    -                     |
| formLineWidth |    图例宽度     |    -    | Number |                    -                     |
|   formColor   |    图例颜色     |    -    | String |                    -                     |

```json
  legend: {
    enable: true, 
    wordWrapEnable: true,

    horizontalAlignment: 'LEFT',
    verticalAlignment: 'TOP',
    orientation: 'HORIZONTAL',
    direction: 'LEFT_TO_RIGHT',

    data: [{
      label: '33',
      form: 'LINE',
      formSize: 20,
      formLineWidth: 50,
      formColor: '#000000',
    }]
  }
```



### Events

|     Option      |   Description    |
| :-------------: | :--------------: |
|      clear      |      清空图表数据      |
|     refresh     |      刷新图表数据      |
|  onValueSelect  | 点击选择 value 触发事件  |
|     onScale     |     放大缩小触发事件     |
|   onTranslate   |      平移触发事件      |
| onNothingSelect | 点击未选择 value 触发事件 |

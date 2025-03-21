---
title: 图像特征提取
description: 图像特征提取是将图像从原始属性空间转化到特征属性空间的过程，旨在提取出具有代表性、稳定性和独立性的特征，以便于后续的图像分析和处理。
date: 2021-07-01
tags:
  - 算法
  - 机器学习
categories: 学习记录
cover: /post/DigitalImageProcessing-FeatureExtraction/picture1.png
hiddenCover: true
hidden: false
readingTime: true
comment: false
author: Adream

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# 图像特征提取

图像特征提取是将图像从原始属性空间转化到特征属性空间的过程，旨在提取出具有代表性、稳定性和独立性的特征，以便于后续的图像分析和处理。良好的图像特征应满足以下三个条件：
1. **代表性或可区分性**：能够高效表达图像类别，并使不同类别间的特征差异最大化。
2. **稳定性**：同一类别图像的特征值应具有相似性，以确保类别内图像的相似度大于类别间图像的相似度。
3. **独立性**：图像特征之间应尽量减少关联性，以更好地表达图像内容。

根据特征的层次和关注点，图像特征提取可分为底层特征提取和高层语义特征提取、全局特征提取和局部特征提取。

## 1 图像颜色特征提取

颜色特征是一种简单且应用广泛的视觉特征，对图像的尺寸、方向、视角变化具有较好的健壮性，是一种全局特征。

### 1.1 颜色直方图

颜色直方图描述图像中像素颜色的数值分布情况，反映图像颜色的统计分布和基本色调，但无法描述像素分布的空间位置信息。

```python
from matplotlib import pyplot as plt
from skimage import data, exposure

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()
img = data.coffee()

plt.figure()
plt.subplot(221)
plt.axis('off')
plt.title('原始图像')
plt.imshow(img)

plt.subplot(222)
plt.axis('off')
plt.title('R通道直方图')
plt.hist(img[:, :, 0].ravel(), bins=256, color='red', alpha=0.6)

plt.subplot(223)
plt.axis('off')
plt.title('G通道直方图')
plt.hist(img[:, :, 1].ravel(), bins=256, color='green', alpha=0.6)

plt.subplot(224)
plt.axis('off')
plt.title('B通道直方图')
plt.hist(img[:, :, 2].ravel(), bins=256, color='blue', alpha=0.6)
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture1.png)

### 1.2 颜色矩

颜色矩用于表征图像内颜色分布，主要关注一阶矩、二阶矩和三阶矩。

```python
from matplotlib import pyplot as plt
from skimage import data, exposure
import numpy as np
from scipy import stats

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()

image = data.coffee()
features = np.zeros(shape=(3, 3))
for k in range(image.shape[2]):
    mu = np.mean(image[:, :, k])
    delta = np.std(image[:, :, k])
    skew = np.mean(stats.skew(image[:, :, k]))
    features[0, k] = mu
    features[1, k] = delta
    features[2, k] = skew
print(features)
```

### 1.3 颜色集

颜色集是对颜色直方图的一种近似，通过颜色空间量化和自动分割技术将图像表示为颜色索引集。

### 1.4 颜色聚合向量

颜色聚合向量在颜色直方图基础上进一步运算，包含颜色频率和部分空间分布信息。

### 1.5 颜色相关图

颜色相关图利用颜色对间的相对距离分布描述空间位置信息。

```python
from matplotlib import pyplot as plt
from skimage import data, exposure
import numpy as np
from scipy import stats

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()

def isValid(X, Y, point):
    if point[0] < 0 or point[0] >= X:
        return False
    if point[1] < 0 or point[1] >= Y:
        return False
    return True

def getNeighbors(X, Y, x, y, dist):
    cn1 = (x + dist, y + dist)
    cn2 = (x + dist, y)
    cn3 = (x + dist, y - dist)
    cn4 = (x, y - dist)
    cn5 = (x - dist, y - dist)
    cn6 = (x - dist, y)
    cn7 = (x - dist, y + dist)
    cn8 = (x, y + dist)
    points = (cn1, cn2, cn3, cn4, cn5, cn6, cn7, cn8)
    Cn = []
    for i in points:
        if isValid(X, Y, i):
            Cn.append(i)
    return Cn

def corrlogram(image, dist):
    XX, YY, tt = image.shape
    cgram = np.zeros((256, 256), dtype=np.int)
    for x in range(XX):
        for y in range(YY):
            for t in range(tt):
                color_i = image[x, y, t]
                neighbors_i = getNeighbors(XX, YY, x, y, dist)
                for j in neighbors_i:
                    j0 = j[0]
                    j1 = j[1]
                    color_j = image[j0, j1, t]
                    cgram[color_i, color_j] += 1
    return cgram

img = data.coffee()
dist = 4
cgram = corrlogram(img, dist)
plt.imshow(cgram)
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture2.png)

## 2 图像纹理特征提取

纹理特征通过像素及其周边空间域像素的灰度分布进行描述，分为局部纹理信息和全局纹理信息。

### 2.1 统计纹理分析方法

统计纹理分析方法通过计算图像的空间频率、边界频率以及空间灰度依赖关系等对纹理进行描述。

```python
from matplotlib import pyplot as plt
from skimage.feature import greycomatrix, greycoprops
from skimage import data
import numpy as np

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()
PATCH_SIZE = 21
image = data.camera()
grass_locations = [(474, 291), (440, 433), (466, 18), (462, 236)]
grass_patches = []
for loc in grass_locations:
    grass_patches.append(image[loc[0]:loc[0]+PATCH_SIZE, loc[1]:loc[1]+PATCH_SIZE])

sky_locations = [(54, 48), (21, 233), (90, 380), (195, 330)]
sky_patches = []
for loc in sky_locations:
    sky_patches.append(image[loc[0]:loc[0]+PATCH_SIZE, loc[1]:loc[1]+PATCH_SIZE])

xs = []
ys = []
for patch in (grass_patches + sky_patches):
    glcm = greycomatrix(patch, [5], [0], 256, symmetric=True, normed=True)
    xs.append(greycoprops(glcm, 'dissimilarity')[0, 0])
    ys.append(greycoprops(glcm, 'correlation')[0, 0])

fig = plt.figure(figsize=(8, 8))
ax = fig.add_subplot(3, 2, 1)
ax.imshow(image, cmap=plt.cm.gray, interpolation='nearest', vmin=0, vmax=255)
for (y, x) in grass_locations:
    ax.plot(x + PATCH_SIZE/2, y + PATCH_SIZE/2, 'gs')
for (y, x) in sky_locations:
    ax.plot(x + PATCH_SIZE/2, y + PATCH_SIZE, 'bs')
ax.set_xlabel('原始图像')
ax.set_xticks([])
ax.set_yticks([])
ax.axis('image')

ax = fig.add_subplot(3, 2, 2)
ax.plot(xs[:len(grass_patches)], ys[:len(grass_patches)], 'go', label='Grass')
ax.plot(xs[:len(sky_patches)], ys[:len(sky_patches)], 'bo', label='Sky')
ax.set_xlabel('灰度共生矩阵相似性')
ax.set_ylabel('灰度共生矩阵相关度')
ax.legend()

for i, patch in enumerate(grass_patches):
    ax = fig.add_subplot(3, len(grass_patches), len(grass_patches)*1 + i + 1)
    ax.imshow(patch, cmap=plt.cm.gray, interpolation='nearest', vmin=0, vmax=255)
    ax.set_xlabel('Grass %d' % (i + 1))

for i, patch in enumerate(sky_patches):
    ax = fig.add_subplot(3, len(sky_patches), len(sky_patches)*2 + i + 1)
    ax.imshow(patch, cmap=plt.cm.gray, interpolation='nearest', vmin=0, vmax=255)
    ax.set_xlabel('Sky %d' % (i + 1))

fig.suptitle('Grey level co-occurrence matrix features', fontsize=14)
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture4.png)

### 2.2 Laws 纹理能量测量法

Laws 纹理能量测量法通过微窗口滤波和宏窗口能量转换提取纹理特征。

### 2.3 Gabor 变换

Gabor 变换借鉴人类视觉特性，用包含多个 Gabor 滤波器的滤波器组提取图像不同频率成分和方位的特征。

### 2.4 局部二值模式

局部二值模式（LBP）通过中心像素点的灰度值作为阈值，比较邻域内像素点灰度值得到二进制编码，描述局部纹理特征。

```python
import skimage.feature
import skimage.segmentation
import skimage.data
import matplotlib.pyplot as plt

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()
img = skimage.data.coffee()
for colour_channel in (0, 1, 2):
    img[:, :, colour_channel] = skimage.feature.local_binary_pattern(img[:, :, colour_channel], 8, 1.0, method='var')
plt.imshow(img)
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture7.png)

## 3 图像形状特征提取

形状特征描述需要以对图像中的物体或区域对象的分割为前提，分为基于轮廓特征和基于区域特征两类。

### 3.1 简单形状特征

- **矩形度**：物体面积与其最小外接矩形面积之比。
- **球状性**：描述目标的球状程度。
- **圆形性**：用目标区域所有边界点定义的特征量。

### 3.2 傅里叶描述符

傅里叶描述符将目标曲线看作一维数值序列，通过傅里叶变换得到描述曲线的傅里叶系数。

### 3.3 形状无关矩

形状无关矩对平移、旋转、尺度等几何变换具有不变性，用于物体分类与识别。

## 4 图像边缘特征提取

图像边缘具有方向和幅度两个主要成分，可通过求导数确定，常用微分算子计算。

### 4.1 梯度边缘检测

梯度的方向是函数增加最快的方向，基于梯度原理发展了多种边缘检测算子。

### 4.2 一阶边缘检测算子

#### 罗伯特算子

罗伯特边缘检测算子用对角线上相邻像素之差代替梯度寻找边缘。

```python
import matplotlib.pyplot as plt
from skimage.data import camera
from skimage.filters import roberts

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()
image = camera()
edge_roberts = roberts(image)
fig, ax = plt.subplots(ncols=2, sharex=True, sharey=True, figsize=(8, 4))
ax[0].imshow(image, cmap='gray')
ax[0].set_title('原始图像')
ax[1].imshow(edge_roberts, cmap='gray')
ax[1].set_title('Roberts 边缘检测')
for a in ax:
    a.axis('off')
plt.tight_layout()
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture12.png)

#### 索贝尔算子

索贝尔边缘检测算子通过两个模板计算梯度幅值，对噪声具有一定的平滑作用。

```python
import matplotlib.pyplot as plt
from skimage.data import camera
from skimage.filters import sobel, sobel_v, sobel_h

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()
image = camera()
edge_sobel = sobel(image)
edge_sobel_v = sobel_v(image)
edge_sobel_h = sobel_h(image)
fig, ax = plt.subplots(ncols=2, nrows=2, sharex=True, sharey=True, figsize=(8, 4))
ax[0, 0].imshow(image, cmap=plt.cm.gray)
ax[0, 0].set_title('原始图像')
ax[0, 1].imshow(edge_sobel, cmap=plt.cm.gray)
ax[0, 1].set_title('Sobel 边缘检测')
ax[1, 0].imshow(edge_sobel_v, cmap=plt.cm.gray)
ax[1, 0].set_title('Sobel 垂直边缘检测')
ax[1, 1].imshow(edge_sobel_h, cmap=plt.cm.gray)
ax[1, 1].set_title('Sobel 水平边缘检测')
for a in ax:
    for j in a:
        j.axis('off')
plt.tight_layout()
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture13.png)

#### Prewitt 算子

Prewitt 算子在形式上与索贝尔算子相同，但系数均为 1，计算更简单。

### 4.3 二阶边缘检测算子

#### 拉普拉斯（Laplace）算子

拉普拉斯算子通过检测二阶导数的零交叉点找到边缘点。

```python
import matplotlib.pyplot as plt
from skimage.data import camera, coffee
from skimage.filters import laplace

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()
image_camera = camera()
edge_laplace_camera = laplace(image_camera)
image_coffee = coffee()
edge_laplace_coffee = laplace(image_coffee)
fig, ax = plt.subplots(ncols=2, nrows=2, sharex=True, sharey=True, figsize=(8, 6))
ax[0, 0].imshow(image_camera, cmap=plt.cm.gray)
ax[0, 0].set_title('原始图像')
ax[0, 1].imshow(edge_laplace_camera, cmap=plt.cm.gray)
ax[0, 1].set_title('Laplace 边缘检测')
ax[1, 0].imshow(image_coffee, cmap=plt.cm.gray)
ax[1, 0].set_title('原始图像')
ax[1, 1].imshow(edge_laplace_coffee, cmap=plt.cm.gray)
ax[1, 1].set_title('Laplace 边缘检测')
for a in ax:
    for j in a:
        j.axis('off')
plt.tight_layout()
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture15.png)

#### LoG 边缘检测算子

LoG 算子结合了 Laplace 算子和 Gauss 算子，通过高斯平滑减少噪声影响。

```python
import matplotlib.pyplot as plt
from skimage.data import camera, coffee
from skimage.filters import laplace, gaussian

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

set_ch()
image = camera()
edge_laplace = laplace(image)
gaussian_image = gaussian(image)
edge_LoG = laplace(gaussian_image)
fig, ax = plt.subplots(ncols=2, nrows=2, sharex=True, sharey=True, figsize=(8, 6))
ax[0, 0].imshow(image, cmap=plt.cm.gray)
ax[0, 0].set_title('原始图像')
ax[0, 1].imshow(edge_laplace, cmap=plt.cm.gray)
ax[0, 1].set_title('Laplace 边缘检测')
ax[1, 0].imshow(gaussian_image, cmap=plt.cm.gray)
ax[1, 0].set_title('高斯平滑后的图像')
ax[1, 1].imshow(edge_LoG, cmap=plt.cm.gray)
ax[1, 1].set_title('LoG 边缘检测')
for a in ax:
    for j in a:
        j.axis('off')
plt.tight_layout()
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture16.png)

## 5 图像点特征提取

图像点特征提取技术中，角点检测算法研究最多、应用最广。

### 5.1 SUSAN 角点检测算法

SUSAN 算法通过核值相似区的大小判别图像角点。

```python
import matplotlib.pyplot as plt
from skimage.data import camera
import numpy as np

def set_ch():
    from pylab import mpl
    mpl.rcParams['font.sans-serif'] = ['FangSong']
    mpl.rcParams['axes.unicode_minus'] = False

def susan_mask():
    mask = np.ones((7, 7))
    mask[0, 0] = 0
    mask[0, 1] = 0
    mask[0, 5] = 0
    mask[0, 6] = 0
    mask[1, 0] = 0
    mask[1, 6] = 0
    mask[5, 0] = 0
    mask[5, 6] = 0
    mask[6, 0] = 0
    mask[6, 1] = 0
    mask[6, 5] = 0
    mask[6, 6] = 0
    return mask

def susan_corner_detection(img):
    img = img.astype(np.float64)
    g = 37 / 2
    circularMask = susan_mask()
    output = np.zeros(img.shape)
    for i in range(3, img.shape[0] - 3):
        for j in range(3, img.shape[1] - 3):
            ir = np.array(img[i-3:i+4, j-3:j+4])
            ir = ir[circularMask == 1]
            ir0 = img[i, j]
            a = np.sum(np.exp(-((ir - ir0) / 10) ** 6))
            if a <= g:
                a = g - a
            else:
                a = 0
            output[i, j] = a
    return output

set_ch()
image = camera()
out = susan_corner_detection(image)
plt.imshow(out, cmap='gray')
plt.show()
```

![](/post/DigitalImageProcessing-FeatureExtraction/picture20.png)

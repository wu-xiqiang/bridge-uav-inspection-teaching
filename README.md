# 基于低空无人机的桥梁智能巡检教学系统

面向高等职业教育的浏览器端三维实训产品。系统把桥梁结构认知、无人机航线规划、航点参数解读、AI 裂缝分割与病害三维定位串成一条完整教学流程。

## 核心功能

- 参数化生成 6 跨、单跨 30 m、净空约 5 m 的预应力混凝土简支高架桥。
- 鼠标左键旋转、滚轮缩放、右键平移、重置视角和自动环绕。
- 4 类专项巡检航线、约 2 m 间隔的密集可选航点、动态无人机与摄像头视锥。
- 桥面上方俯视航线、桥梁两侧对向拍摄航线，以及桥底绕墩折线航线。
- 6 处预置细小裂缝、AI 教学推理进度、风险排序、图像分割及最大宽度标注。
- 裂缝列表、巡检图像和三维模型空间联动；选中裂缝时，模型旁直接显示分割图像、位置与最大宽度。

## 技术栈

React、TypeScript、Vite/vinext、Three.js、React Three Fiber、Drei、Lucide React。

## 运行

需要 Node.js 22 或更高版本。

```bash
pnpm install
pnpm dev
```

生产构建与测试：

```bash
pnpm build
pnpm test
```

GitHub Pages 静态构建：

```bash
pnpm build:pages
```

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会自动构建 `dist-pages` 并发布 Pages；仓库名会自动写入资源基础路径，无需手动修改裂缝图像地址。

## 教学操作

按照顶部步骤依次点击“生成桥梁场景”“生成巡检航线”“AI 裂缝检测”。航点可点击查看坐标和相机姿态；AI 完成后，从右侧结果列表点击病害即可飞行定位，并切换原图/分割结果。

详细说明见 [使用说明](docs/user-guide.md) 和 [技术设计](docs/technical-design.md)。

## AI 教学模拟数据

当前版本没有捆绑真实工程模型权重。检测过程和 6 组结果为明确标注的教学演示数据，本地巡检图像位于 `public/inspection/`。替换真实 U-Net、YOLO 分割或 Mask R-CNN 模型时，按 `CrackRecord` 数据结构返回结果即可保持三维联动逻辑不变。

## 演示资料

- 演示视频：`output/bridge-inspection-demo.mp4`
- 演示截图：`output/screenshots/`

> 本系统仅用于教学模拟，不能直接替代实际桥梁安全鉴定。

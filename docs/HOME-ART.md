# 家园场景素材

2026-10-06，通过内置 `image_gen.imagegen` 生成成功，没有调用 CLI / API fallback。用途是游戏中可建设、升级的家园地图背景。

最终资产：`public/art/home-v1.png`（约 3.1 MiB，PNG）。由 `src/home-ui.ts` 使用 Vite BASE_URL 引用，Workbox 纳入预缓存。原始输出保留于 Codex generated_images，项目不依赖那个目录。

已检查：六座建筑与功能位置对应、中央庭院可放标题、没有人物、文字、标志或水印。可点击的建筑标签、等级、资源与按钮由游戏代码渲染。

## 最终提示词

```text
Use case: stylized-concept. Asset type: background illustration for a local portrait mobile roguelite game's playable home village. Create a polished square illustrated cozy fantasy adventurer hamlet viewed from a clear three-quarter overhead angle. Six distinct small buildings arranged around an open central stone courtyard: a green-roof wooden adventurer cottage in upper left, a little herb garden with flower beds in upper right, a warm forge workshop with anvil in middle left, a blue-roof astronomical tower in middle right, a gold-accented supply storehouse in lower left, a small pale stone shrine with cyan crystals in lower right. Winding pathways connect these around the central courtyard. Soft cream, sage green and warm gold palette, cute chibi proportions, clean dark outlines, hand-painted game asset rendering, readable shapes at a small mobile size, gentle warm sunlight, lush grass, a small water feature, no people, no text, no lettering, no logos, no user interface, no borders, no watermark. Buildings occupy the center 80% of the composition with comfortably spaced recognizable silhouettes; keep central courtyard open for a game title overlay. This is one coherent village illustration, not a collage.
```
